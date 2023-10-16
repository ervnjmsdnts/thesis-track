import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { privateProcedure, publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { db } from '@/db';
import { User } from '@prisma/client';
import { z } from 'zod';

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
    const dbUsers = (await db.user.findMany()) as User[];

    return dbUsers;
  }),
  getGroups: publicProcedure.query(async () => {
    const dbGroups = await db.group.findMany({ include: { users: true } });

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
    .input(z.object({ section: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await db.user.update({
        where: { id: ctx.user.id as unknown as string | undefined },
        data: { sectionId: input.section },
      });
    }),
});

export type AppRouter = typeof appRouter;
