import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { pusherServer } from '@/lib/pusher';
import { db } from '@/db';
import { Task } from '@prisma/client';

export const taskRouter = router({
  createTask: publicProcedure
    .input(
      z.object({
        title: z.string(),
        status: z.enum(['PENDING', 'ONGOING', 'COMPLETE']),
        type: z.enum(['DOCUMENTATION', 'DEVELOPMENT', 'DESIGN', 'OTHER']),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
        dueDate: z.string(),
        groupId: z.string(),
        assigneeId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const groupTasks = await db.task.findMany({
        where: { groupId: input.groupId, status: input.status },
        select: { position: true },
      });

      const maxPosition = Math.max(...groupTasks.map((task) => task.position));

      const newTask = await db.task.create({
        data: {
          ...input,
          dueDate: new Date(input.dueDate),
          position: maxPosition + 1,
        },
      });

      pusherServer.trigger(input.groupId, 'new-task', newTask);

      return newTask;
    }),
  updateTask: publicProcedure
    .input(
      z.object({
        title: z.string(),
        type: z.enum(['DOCUMENTATION', 'DEVELOPMENT', 'DESIGN', 'OTHER']),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
        dueDate: z.string(),
        assigneeId: z.string(),
        taskId: z.string(),
        groupId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const updatedTask = await db.task.update({
        where: { id: input.taskId },
        data: {
          title: input.title,
          type: input.type,
          priority: input.priority,
          dueDate: new Date(input.dueDate),
          assigneeId: input.assigneeId,
        },
      });

      pusherServer.trigger(input.groupId, 'update-task', updatedTask);

      return updatedTask;
    }),
  deleteTask: publicProcedure
    .input(z.object({ taskId: z.string(), groupId: z.string() }))
    .mutation(async ({ input }) => {
      await db.task.delete({ where: { id: input.taskId } });

      pusherServer.trigger(input.groupId, 'delete-task', input.taskId);
    }),
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
