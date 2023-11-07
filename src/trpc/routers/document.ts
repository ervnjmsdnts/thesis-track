import { db } from '@/db';
import { privateProcedure, publicProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const documentRouter = router({
  groupDocuments: privateProcedure.query(async ({ ctx }) => {
    const currentGroup = await db.group.findFirst({
      where: { members: { some: { id: ctx.user.id as unknown as string } } },
    });

    if (!currentGroup) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }

    const groupDocuments = await db.document.findMany({
      where: { groupId: currentGroup.id },
      include: { comments: true },
    });

    return groupDocuments;
  }),
  getDocument: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const currentGroup = await db.group.findFirst({
        where: { members: { some: { id: ctx.user.id as unknown as string } } },
      });

      if (!currentGroup) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const file = await db.document.findFirst({
        where: {
          key: input.key,
          groupId: currentGroup.id,
        },
      });

      if (!file) throw new TRPCError({ code: 'NOT_FOUND' });

      return file;
    }),
  addComment: privateProcedure
    .input(z.object({ documentId: z.string(), content: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await db.comment.create({
        data: {
          authorId: ctx.user.id as unknown as string,
          content: input.content,
          documentId: input.documentId,
        },
      });
    }),
  getComments: publicProcedure
    .input(z.object({ documentId: z.string() }))
    .query(async ({ input }) => {
      const comments = await db.comment.findMany({
        where: { documentId: input.documentId },
        include: { author: true },
      });

      return comments;
    }),
  updateStatus: publicProcedure
    .input(
      z.object({
        status: z.enum(['APPROVED', 'REJECTED']),
        documentId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db.document.update({
        where: { id: input.documentId },
        data: { status: input.status },
      });
    }),
  staffGetPendingDocuments: privateProcedure.query(async ({ ctx }) => {
    const documents = await db.document.findMany({
      where: {
        group: { members: { some: { id: ctx.user.id as unknown as string } } },
        status: 'PENDING',
      },
      include: { group: true },
    });

    return documents;
  }),
});
