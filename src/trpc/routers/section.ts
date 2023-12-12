import { db } from '@/db';
import { privateProcedure, publicProcedure, router } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const sectionRouter = router({
  getAll: publicProcedure.query(async () => {
    const dbSections = await db.section.findMany();

    return dbSections;
  }),

  getAllBasedOnAssignedSections: privateProcedure.query(async ({ ctx }) => {
    const instructor = await db.user.findUnique({
      where: { id: ctx.user.id as unknown as string },
      include: { assignedSections: true },
    });

    if (!instructor || !instructor.id) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }

    const sectionIds = instructor.assignedSections.map((section) => section.id);

    const sections = await db.section.findMany({
      where: {
        id: { in: sectionIds },
      },
    });

    return sections;
  }),

  updateSection: publicProcedure
    .input(z.object({ name: z.string(), sectionId: z.string() }))
    .mutation(async ({ input }) => {
      await db.section.update({
        where: { id: input.sectionId },
        data: { name: input.name },
      });
    }),

  createSection: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      await db.section.create({ data: { name: input.name } });
    }),
});
