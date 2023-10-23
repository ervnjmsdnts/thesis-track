import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { pusherServer } from '@/lib/pusher';
import { db } from '@/db';
import { Task } from '@prisma/client';

export const taskRouter = router({
  updateStatus: publicProcedure
    .input(
      z.object({
        tasks: z.any().array(),
        taskId: z.string(),
        groupId: z.string(),
        status: z.enum(['PENDING', 'ONGOING', 'COMPLETE']),
      }),
    )
    .mutation(async ({ input }) => {
      pusherServer.trigger(input.groupId, 'new-column', input.tasks);
      await db.$transaction(async (prisma) => {
        const updatedTasks: Task[] = [];
        await db.task.update({
          where: { id: input.taskId },
          data: { status: input.status },
        });

        for (const t of input.tasks) {
          await prisma.$executeRawUnsafe(
            `UPDATE \`Task\` SET position = ? WHERE id = ?;`,
            t.position,
            t.id,
          );

          const updatedTask = await prisma.task.findUnique({
            where: { id: t.id },
          });

          updatedTasks.push(updatedTask!);
        }

        return updatedTasks;
      });
    }),
});
