import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { privateProcedure, publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { db } from '@/db';
import { Resend } from 'resend';
import { z } from 'zod';
import InviteEmail from '@/email/invite-email';

const resend = new Resend(process.env.RESEND_API_KEY ?? '');

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = getUser();

    if (!user.id || !user.email) throw new TRPCError({ code: 'UNAUTHORIZED' });

    const dbUser = await db.user.findFirst({ where: { id: user.id } });

    if (!dbUser) {
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
          firstName: user.given_name!,
          lastName: user.family_name!,
          picture: user.picture,
        },
      });

      return { needsRole: true, success: false };
    }

    return { success: true, needsRole: false };
  }),
  getUsers: publicProcedure.query(async () => {
    const dbUsers = await db.user.findMany({
      include: { section: true },
    });

    return dbUsers;
  }),
  getOtherUsers: privateProcedure.query(async ({ ctx }) => {
    const dbUsers = await db.user.findMany({
      where: {
        id: { not: ctx.user.id as unknown as string | undefined },
        group: { none: {} },
      },
      include: { group: { select: { members: true } } },
    });

    return dbUsers;
  }),
  getGroups: publicProcedure.query(async () => {
    const dbGroups = await db.group.findMany({ include: { members: true } });

    return dbGroups;
  }),
  setUserRole: privateProcedure
    .input(
      z.object({
        role: z.enum(['STUDENT', 'ADVISER', 'INSTRUCTOR']),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await db.user.update({
        where: { id: ctx.user.id as unknown as string | undefined },
        data: { role: input.role },
      });
    }),
  getSections: publicProcedure.query(async () => {
    const dbSections = await db.section.findMany();

    return dbSections;
  }),
  setUserSection: privateProcedure
    .input(z.object({ sectionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await db.user.update({
        where: { id: ctx.user.id as unknown as string | undefined },
        data: { sectionId: input.sectionId },
      });
    }),
  studentCreateGroup: privateProcedure
    .input(
      z.object({
        title: z.string().nullable(),
        members: z.object({ id: z.string(), email: z.string() }).array(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await db.group.create({
        data: {
          ...(input.title ? { title: input.title } : {}),
          members: {
            connect: [
              ...input.members.map((m) => ({ id: m.id })),
              { id: ctx.user.id as unknown as string | undefined },
            ],
          },
        },
      });

      const emailPromises = [];

      for (const member of input.members) {
        const promise = resend.sendEmail({
          from: 'invite@thesistrack.cloudns.ph',
          to: member.email,
          subject: 'Invitation',
          react: InviteEmail(),
        });
        emailPromises.push(promise);
      }

      try {
        await Promise.all(emailPromises);
      } catch {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }
    }),
});

export type AppRouter = typeof appRouter;
