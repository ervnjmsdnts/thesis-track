import { db } from '@/db';
import { privateProcedure, publicProcedure, router } from '../trpc';
import { z } from 'zod';
import InviteEmail from '@/email/invite-email';
import { TRPCError } from '@trpc/server';
import { resend } from '@/lib/resend';

export const groupRouter = router({
  getAll: publicProcedure.query(async () => {
    const groups = await db.group.findMany({
      where: { isActive: true },
      include: {
        members: { include: { section: true } },
        documents: { include: { comments: true } },
      },
    });

    return groups;
  }),

  getBasedOnAssignedSection: privateProcedure.query(async ({ ctx }) => {
    const instructor = await db.user.findUnique({
      where: { id: ctx.user.id as unknown as string, isActive: true },
      include: { assignedSections: true },
    });

    if (!instructor || !instructor.id) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }

    const sectionIds = instructor.assignedSections.map((section) => section.id);

    const groups = await db.group.findMany({
      where: {
        isActive: true,
        members: {
          some: {
            sectionId: {
              in: sectionIds,
            },
          },
        },
      },
      include: {
        members: { include: { section: true } },
        documents: { include: { comments: true } },
      },
    });

    return groups;
  }),

  updateGroup: privateProcedure
    .input(
      z.object({
        groupId: z.string(),
        adviserId: z.string().optional(),
        title: z.string(),
        members: z
          .object({
            id: z.string(),
            email: z.string(),
            firstName: z.string(),
            lastName: z.string(),
          })
          .array(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const group = await db.group.findUnique({
        where: { id: input.groupId },
        include: { members: true },
      });

      if (!group || !group.id) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const existingMembers = group.members;
      const currentAdviser = group.members.find((m) => m.role === 'ADVISER');
      const currentTitle = group.title;

      if (currentTitle !== input.title) {
        await db.group.update({
          where: { id: group.id },
          data: { title: input.title },
        });
      }

      const removedMembers = existingMembers.filter((existingMember) => {
        return (
          !input.members.some((m) => m.id === existingMember.id) &&
          existingMember.role === 'STUDENT'
        );
      });

      const newMembers = input.members.filter((newMember) => {
        return !existingMembers.some(
          (existingMember) => existingMember.id === newMember.id,
        );
      });

      if (input.adviserId && currentAdviser?.id !== input.adviserId) {
        await db.group.update({
          where: { id: group.id },
          data: {
            members: {
              disconnect: currentAdviser && { id: currentAdviser.id },
              connect: { id: input.adviserId },
            },
          },
        });
      }

      if (removedMembers.length > 0 || newMembers.length > 0) {
        await db.group.update({
          where: { id: group.id },
          data: {
            members: {
              connect: newMembers.map((newMember) => ({ id: newMember.id })),
              disconnect: removedMembers.map((removedMember) => ({
                id: removedMember.id,
              })),
            },
          },
          include: { members: true },
        });
      }
    }),
  deleteGroup: publicProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ input }) => {
      await db.group.update({
        where: { id: input.groupId },
        data: { isActive: false },
      });
    }),

  createGroupByInstructor: privateProcedure
    .input(
      z.object({
        title: z.string(),
        adviserId: z.string().optional(),
        members: z
          .object({
            id: z.string(),
            email: z.string(),
            firstName: z.string(),
            lastName: z.string(),
          })
          .array(),
      }),
    )
    .mutation(async ({ input }) => {
      await db.group.create({
        data: {
          title: input.title,
          members: {
            connect: [
              ...(input.adviserId ? [{ id: input.adviserId }] : []),
              ...input.members.map((m) => ({ id: m.id })),
            ],
          },
        },
      });
    }),
  createGroupByStudent: privateProcedure
    .input(
      z.object({
        title: z.string(),
        members: z
          .object({
            id: z.string(),
            email: z.string(),
            firstName: z.string(),
            lastName: z.string(),
          })
          .array(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const group = await db.group.create({
        data: {
          title: input.title,
          members: { connect: { id: ctx.user.id as unknown as string } },
        },
      });

      if (input.members.length === 0) {
        return { success: true };
      }

      if (!group || !group.id || !group.title)
        throw new TRPCError({ code: 'NOT_FOUND' });

      const emailPromises = [];

      for (const student of input.members) {
        const name = `${student.firstName} ${student.lastName}`;
        const promise = resend.sendEmail({
          from: 'invite@thesistrack.cloudns.ph',
          to: student.email,
          subject: 'ThesisTrack: Invite',
          react: InviteEmail({
            title: group.title,
            groupId: group.id,
            senderEmail: ctx.user.email as unknown as string,
            senderName: `${ctx.user.given_name} ${ctx.user.family_name}`,
            userId: student.id,
            userName: name,
          }),
        });
        emailPromises.push(promise);
      }

      try {
        await Promise.all(emailPromises);
        return input.members.map(
          (student) => `${student.firstName} ${student.lastName}`,
        );
      } catch {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }
    }),
  getCurrent: privateProcedure.query(async ({ ctx }) => {
    const group = await db.group.findFirst({
      where: {
        members: { some: { id: ctx.user.id as unknown as string | undefined } },
      },
      include: { members: { include: { section: true } }, tasks: true },
    });

    return group;
  }),
  getGroupFiles: privateProcedure.query(async ({ ctx }) => {
    const groupFiles = await db.group.findMany({
      where: {
        members: { some: { id: ctx.user.id as unknown as string | undefined } },
      },
      include: { documents: true },
    });

    return groupFiles;
  }),
  sendStudentInvites: privateProcedure
    .input(
      z.object({
        students: z
          .object({
            id: z.string(),
            email: z.string(),
            firstName: z.string(),
            lastName: z.string(),
          })
          .array(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const emailPromises = [];
      const group = await db.group.findFirst({
        where: { members: { some: { id: ctx.user.id as unknown as string } } },
      });

      if (!group || !group.id || !group.title)
        throw new TRPCError({ code: 'NOT_FOUND' });

      for (const student of input.students) {
        const name = `${student.firstName} ${student.lastName}`;
        const promise = resend.sendEmail({
          from: 'invite@thesistrack.cloudns.ph',
          to: student.email,
          subject: 'ThesisTrack: Invite',
          react: InviteEmail({
            title: group.title,
            groupId: group.id,
            senderEmail: ctx.user.email as unknown as string,
            senderName: `${ctx.user.given_name} ${ctx.user.family_name}`,
            userId: student.id,
            userName: name,
          }),
        });
        emailPromises.push(promise);
      }

      try {
        await Promise.all(emailPromises);
        return input.students.map(
          (student) => `${student.firstName} ${student.lastName}`,
        );
      } catch {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }
    }),
  sendAdviserInvite: privateProcedure
    .input(
      z.object({
        adviserId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await db.user.findFirst({ where: { id: input.adviserId } });

      if (!user || !user.id || !user.email || !user.firstName || !user.lastName)
        throw new TRPCError({ code: 'NOT_FOUND' });

      const group = await db.group.findFirst({
        where: { members: { some: { id: ctx.user.id as unknown as string } } },
      });

      if (!group || !group.id || !group.title)
        throw new TRPCError({ code: 'NOT_FOUND' });

      const name = `${user.firstName} ${user.lastName}`;

      await resend.sendEmail({
        from: 'invite@thesistrack.cloudns.ph',
        to: user.email,
        subject: 'ThesisTrack: Invite',
        react: InviteEmail({
          title: group.title,
          groupId: group.id,
          senderEmail: ctx.user.email as unknown as string,
          senderName: `${ctx.user.given_name} ${ctx.user.family_name}`,
          userId: input.adviserId,
          userName: name,
        }),
      });

      return name;
    }),
  acceptInvitation: publicProcedure
    .input(z.object({ userId: z.string(), groupId: z.string() }))
    .query(async ({ input }) => {
      const group = await db.group.findFirst({
        where: { id: input.groupId, members: { some: { id: input.userId } } },
      });
      if (group && group.id) return { success: true };

      await db.group.update({
        where: { id: input.groupId },
        data: { members: { connect: { id: input.userId } } },
      });

      return { success: true };
    }),

  changeProgress: publicProcedure
    .input(
      z.object({
        progression: z.enum([
          'Topic Approval',
          'Adviser Invitation',
          'Chapt 1-3',
          'Chapt 1-3 Approval',
          'Proposal Paper Forms',
          'Proposal Defense',
          'Compliance Matrix (Proposal)',
          'Revisions Chapt 1-3',
          'System Development',
          'Compliance Matrix Approval (Proposal)',
          'Chapt 4-5',
          'Oral Defense Form',
          'Oral Defense',
          'Compliance Matrix (Oral)',
          'Capstone Paper Revisions',
          'Compliance Matrix Approval (Oral)',
          'Library Hardbound',
        ]),
        groupId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db.group.update({
        where: { id: input.groupId },
        data: { progression: input.progression },
      });
    }),
});
