'use client';

import { trpc } from '@/app/_trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Comment, DocumentStatus, Role, User } from '@prisma/client';
import { ChevronRight, Ghost, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { DocumentStatusBadge } from './document-status';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

const schema = z.object({ content: z.string() });

type Schema = z.infer<typeof schema>;

export default function Comments({
  userRole,
  status,
  documentId,
  currPage,
  comments,
  getLoading,
  selectedComment,
}: {
  userRole: Role;
  status: DocumentStatus;
  documentId: string;
  currPage: number;
  comments: (Comment & { author: User })[] | undefined;
  getLoading: boolean;
  selectedComment: string | undefined;
}) {
  const isStaffRole = userRole === 'INSTRUCTOR' || userRole === 'ADVISER';

  const pageComments = comments?.filter((comment) => comment.page === currPage);

  const util = trpc.useUtils();

  const router = useRouter();

  const { mutate: addComment, isLoading: addLoading } =
    trpc.document.addComment.useMutation({
      onSuccess: () => {
        util.document.getComments.invalidate();
        form.reset({ content: '' });
      },
    });

  const { mutate: updateStatus } = trpc.document.updateStatus.useMutation({
    onSuccess: () => router.refresh(),
  });

  const form = useForm<Schema>({ resolver: zodResolver(schema) });

  const submit = (data: Schema) => {
    addComment({ content: data.content, documentId, page: currPage });
  };

  return (
    <div className='px-4 flex h-full flex-col'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Comments</h2>
        {isStaffRole ? (
          <div className='space-x-2'>
            <Button
              onClick={() => updateStatus({ documentId, status: 'APPROVED' })}
              disabled={status !== 'PENDING'}
              variant='outline'
              className={cn(
                'border border-green-400 text-green-400 hover:bg-green-400/80 hover:text-white',
                status === 'APPROVED' && 'border-none bg-green-400 text-white',
              )}>
              Approve
            </Button>
            <Button
              variant='outline'
              className={cn(
                'border border-red-400 text-red-400 hover:bg-red-400/80 hover:text-white',
                status === 'REJECTED' && 'border-none bg-red-400 text-white',
              )}
              disabled={status !== 'PENDING'}
              onClick={() => updateStatus({ documentId, status: 'REJECTED' })}>
              Reject
            </Button>
          </div>
        ) : (
          <DocumentStatusBadge status={status} />
        )}
      </div>
      <div className='flex-1 flex flex-col mt-4'>
        {pageComments && pageComments.length > 0 ? (
          <div
            className={cn(
              'flex flex-col gap-6 items-start flex-grow h-0 overflow-y-auto',
            )}>
            {pageComments.map((comment) => (
              <div
                key={comment.id}
                className={cn(
                  'text-sm flex items-start gap-4 p-1 w-full rounded-lg',
                  comment.id === selectedComment && 'bg-muted',
                )}>
                <Avatar className='w-10 h-10 border'>
                  <AvatarImage
                    src={comment.author?.picture as string | undefined}
                  />
                  <AvatarFallback
                    className={cn(
                      comment.id === selectedComment && 'bg-white',
                    )}>
                    {comment.author.firstName[0]}
                    {comment.author.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className='grid gap-1'>
                  <div className='flex items-center gap-2'>
                    <div className='font-semibold'>
                      {comment.author.firstName} {comment.author.lastName}
                    </div>
                    <div className='text-zinc-500 text-xs dark:text-zinc-400'>
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                  <div className='break-all w-full h-full'>
                    {comment.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : getLoading ? (
          <div className='flex flex-col items-center mt-16'>
            <Loader2 className='w-8 h-8 animate-spin' />
          </div>
        ) : (
          <div className='flex flex-col items-center gap-2 mt-16'>
            <Ghost className='h-8 w-8 text-zinc-800' />
            <h3 className='font-semibold text-xl'>No Comments</h3>
          </div>
        )}
      </div>
      {isStaffRole ? (
        <div className='flex items-center justify-between'>
          <Input
            placeholder='Type your comment...'
            disabled={addLoading}
            {...form.register('content')}
            onKeyDown={(e) => e.key === 'Enter' && form.handleSubmit(submit)()}
          />
          <Button onClick={form.handleSubmit(submit)} disabled={addLoading}>
            {addLoading ? (
              <Loader2 className='w-4 h-4' />
            ) : (
              <ChevronRight className='w-4 h-4' />
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
