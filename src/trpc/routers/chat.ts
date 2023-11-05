import { z } from 'zod';
import { privateProcedure, publicProcedure, router } from '../trpc';
import { db } from '@/db';
import { pusherServer } from '@/lib/pusher';

export const chatRouter = router({
  getChats: publicProcedure
    .input(
      z.object({
        groupId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const chats = await db.chat.findMany({
        where: { groupId: input.groupId },
        include: { author: true },
      });

      return chats;
    }),
  createMessage: privateProcedure
    .input(z.object({ content: z.string(), groupId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      console.log(input.groupId);
      const chat = await db.chat.create({
        data: {
          content: input.content,
          authorId: ctx.user.id as unknown as string,
          groupId: input.groupId,
        },
        include: { author: true },
      });

      pusherServer.trigger(`chat_${input.groupId}`, 'newMessage', chat);

      return;
    }),
});
