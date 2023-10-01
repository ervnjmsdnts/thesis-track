import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { db } from '@/db';
import { User } from '@prisma/client';

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
    }

    return { success: true };
  }),
  getUsers: publicProcedure.query(async () => {
    const dbUsers = (await db.user.findMany()) as User[];

    return dbUsers;
  }),
  getGroups: publicProcedure.query(async () => {
    const dbGroups = await db.group.findMany({ include: { users: true } });

    return dbGroups;
  }),
});

export type AppRouter = typeof appRouter;
