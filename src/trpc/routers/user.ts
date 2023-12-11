import { db } from '@/db';
import { privateProcedure, publicProcedure, router } from '../trpc';
import { z } from 'zod';

export const userRouter = router({
  getAll: publicProcedure.query(async () => {
    const users = await db.user.findMany({ include: { section: true } });

    return users;
  }),
  getCurrent: privateProcedure.query(async ({ ctx }) => {
    const user = await db.user.findFirst({
      where: { id: ctx.user.id as unknown as string | undefined },
    });

    return user;
  }),
  getStudentsWithNoGroup: privateProcedure.query(async ({ ctx }) => {
    const users = await db.user.findMany({
      where: {
        id: { not: ctx.user.id as unknown as string | undefined },
        group: { none: {} },
        role: 'STUDENT',
      },
      include: { group: { select: { members: true } } },
    });

    return users;
  }),
  setRole: privateProcedure
    .input(
      z.object({
        role: z.enum(['STUDENT', 'ADVISER', 'INSTRUCTOR', 'ADMIN']),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await db.user.update({
        where: { id: ctx.user.id as unknown as string | undefined },
        data: { role: input.role },
      });
    }),
  setSection: privateProcedure
    .input(z.object({ sectionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await db.user.update({
        where: { id: ctx.user.id as unknown as string | undefined },
        data: { sectionId: input.sectionId },
      });
    }),
});
