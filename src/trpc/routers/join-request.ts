import { z } from 'zod';
import { privateProcedure, publicProcedure, router } from '../trpc';
import { db } from '@/db';

export const joinRequestRouter = router({
  requestToJoinGroup: privateProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await db.joinRequest.create({
        data: {
          userId: ctx.user.id as unknown as string,
          groupId: input.groupId,
        },
      });
    }),

  getJoinRequests: publicProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ input }) => {
      const requests = await db.joinRequest.findMany({
        where: { groupId: input.groupId },
        include: { user: true },
      });

      return requests;
    }),

  deleteRequest: publicProcedure
    .input(z.object({ requestId: z.string() }))
    .mutation(async ({ input }) => {
      await db.joinRequest.delete({ where: { id: input.requestId } });
    }),

  acceptRequest: publicProcedure
    .input(
      z.object({
        requestId: z.string(),
        userRequestId: z.string(),
        groupId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const [request] = await db.$transaction([
        db.joinRequest.update({
          where: { id: input.requestId },
          data: { status: 'APPROVED' },
          include: { user: true },
        }),
        db.group.update({
          where: { id: input.groupId },
          data: { members: { connect: { id: input.userRequestId } } },
        }),
      ]);

      return request;
    }),

  rejectRequest: publicProcedure
    .input(
      z.object({
        requestId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const request = await db.joinRequest.update({
        where: { id: input.requestId },
        data: { status: 'REJECTED' },
        include: { user: true },
      });

      return request;
    }),
});
