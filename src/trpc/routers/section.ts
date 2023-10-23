import { db } from '@/db';
import { publicProcedure, router } from '../trpc';

export const sectionRouter = router({
  getAll: publicProcedure.query(async () => {
    const dbSections = await db.section.findMany();

    return dbSections;
  }),
});
