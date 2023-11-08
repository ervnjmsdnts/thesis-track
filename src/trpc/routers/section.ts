import { db } from '@/db';
import { publicProcedure, router } from '../trpc';
import { z } from 'zod';

export const sectionRouter = router({
  getAll: publicProcedure.query(async () => {
    const dbSections = await db.section.findMany();

    return dbSections;
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
