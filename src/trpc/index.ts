import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { db } from '@/db';
import { userRouter } from './routers/user';
import { groupRouter } from './routers/group';
import { sectionRouter } from './routers/section';
import { taskRouter } from './routers/task';
import { documentRouter } from './routers/document';
import { chatRouter } from './routers/chat';
import { joinRequestRouter } from './routers/join-request';

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = getUser();

    if (!user.id || !user.email) throw new TRPCError({ code: 'UNAUTHORIZED' });

    const dbUser = await db.user.findUnique({ where: { id: user.id } });

    if (!dbUser) {
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
          firstName: user.given_name ?? '',
          lastName: user.family_name ?? '',
          picture: user.picture,
        },
      });

      return { needsRole: true, success: false, role: null };
    }

    if (!dbUser.role) {
      return { needsRole: true, success: false, role: null };
    }

    if (!dbUser.picture && user.picture) {
      await db.user.update({
        where: { id: dbUser.id },
        data: { picture: user.picture },
      });
    }

    return { success: true, needsRole: false, role: dbUser.role };
  }),
  user: userRouter,
  group: groupRouter,
  section: sectionRouter,
  task: taskRouter,
  document: documentRouter,
  chat: chatRouter,
  joinRequest: joinRequestRouter,
});

export type AppRouter = typeof appRouter;
