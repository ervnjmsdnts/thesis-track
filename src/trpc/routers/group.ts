import { db } from '@/db';
import { privateProcedure, publicProcedure, router } from '../trpc';
import { z } from 'zod';
import { Resend } from 'resend';
import InviteEmail from '@/email/invite-email';
import { TRPCError } from '@trpc/server';

const resend = new Resend(process.env.RESEND_API_KEY ?? '');

export const groupRouter = router({
  getAll: publicProcedure.query(async () => {
    const groups = await db.group.findMany({
      include: { members: true, documents: { include: { comments: true } } },
    });

    return groups;
  }),
  createGroupByStudent: privateProcedure
    .input(
      z.object({
        title: z.string().nullable(),
        members: z.object({ id: z.string(), email: z.string() }).array(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await db.group.create({
        data: {
          ...(input.title ? { title: input.title } : {}),
          members: {
            connect: [
              ...input.members.map((m) => ({ id: m.id })),
              { id: ctx.user.id as unknown as string | undefined },
            ],
          },
        },
      });

      const emailPromises = [];

      for (const member of input.members) {
        const promise = resend.sendEmail({
          from: 'invite@thesistrack.cloudns.ph',
          to: member.email,
          subject: 'Invitation',
          react: InviteEmail(),
        });
        emailPromises.push(promise);
      }

      try {
        await Promise.all(emailPromises);
      } catch {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }
    }),
  getCurrent: privateProcedure.query(async ({ ctx }) => {
    const group = await db.group.findFirst({
      where: {
        members: { some: { id: ctx.user.id as unknown as string | undefined } },
      },
      include: { members: { include: { section: true } }, tasks: true },
    });

    return group;
  }),
  getGroupFiles: privateProcedure.query(async ({ ctx }) => {
    const groupFiles = await db.group.findMany({
      where: {
        members: { some: { id: ctx.user.id as unknown as string | undefined } },
      },
      include: { documents: true },
    });

    return groupFiles;
  }),
});
