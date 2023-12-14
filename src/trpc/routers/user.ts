import { db } from '@/db';
import { privateProcedure, publicProcedure, router } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const userRouter = router({
  getAll: publicProcedure.query(async () => {
    const users = await db.user.findMany({
      where: { isActive: true },
      include: { section: true, assignedSections: true },
    });

    return users;
  }),
  getBasedOnAssignedSection: privateProcedure.query(async ({ ctx }) => {
    const instructor = await db.user.findUnique({
      where: { id: ctx.user.id as unknown as string },
      include: { assignedSections: true },
    });

    if (!instructor || !instructor.id) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }

    const sectionIds = instructor.assignedSections.map((section) => section.id);

    const users = await db.user.findMany({
      where: {
        sectionId: { in: sectionIds },
        isActive: true,
      },
      include: { section: true },
    });

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

  updateRole: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(['ADMIN', 'ADVISER', 'INSTRUCTOR', 'STUDENT']),
      }),
    )
    .mutation(async ({ input }) => {
      await db.user.update({
        where: { id: input.userId },
        data: { role: input.role },
      });
    }),

  deleteUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      await db.user.update({
        where: { id: input.userId },
        data: { isActive: false },
      });
    }),

  assignSection: privateProcedure
    .input(
      z.object({ instructorId: z.string(), sectionIds: z.string().array() }),
    )
    .mutation(async ({ input }) => {
      const instructor = await db.user.findUnique({
        where: { id: input.instructorId },
        include: { assignedSections: true },
      });

      if (!instructor || !instructor.id) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const existingSections = instructor.assignedSections;

      const removedSections = existingSections.filter((section) => {
        return !input.sectionIds.some((id) => id === section.id);
      });

      const newSections = input.sectionIds.filter((id) => {
        return !existingSections.some((section) => section.id === id);
      });

      if (removedSections.length > 0 || newSections.length > 0) {
        await db.user.update({
          where: { id: instructor.id },
          data: {
            assignedSections: {
              connect: newSections.map((sectionId) => ({ id: sectionId })),
              disconnect: removedSections.map((section) => ({
                id: section.id,
              })),
            },
          },
        });
      }
    }),

  updateSection: publicProcedure
    .input(z.object({ sectionId: z.string(), userId: z.string() }))
    .mutation(async ({ input }) => {
      await db.user.update({
        where: { id: input.userId },
        data: { sectionId: input.sectionId },
      });
    }),
});
