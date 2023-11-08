import { db } from '@/db';
import { privateProcedure, publicProcedure, router } from '../trpc';
import { z } from 'zod';
import InviteEmail from '@/email/invite-email';
import { TRPCError } from '@trpc/server';
import { resend } from '@/lib/resend';

export const groupRouter = router({
  getAll: publicProcedure.query(async () => {
    const groups = await db.group.findMany({
      include: { members: true, documents: { include: { comments: true } } },
    });

    return groups;
  }),
  createGroupByStudent: privateProcedure
    .input(
      z.object({
        title: z.string().nullable(),
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
});
