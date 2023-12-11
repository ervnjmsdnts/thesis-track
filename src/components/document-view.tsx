'use client';

import { DocumentStatus, Role } from '@prisma/client';
import Comments from './comments';
import PDFRenderer from './pdf-renderer';
import { useState } from 'react';
import { trpc } from '@/app/_trpc/client';
import { Toggle } from '@/components/ui/toggle';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export default function DocumentView({
  url,
  documentId,
  userRole,
  status,
}: {
  url: string;
  documentId: string;
  userRole: Role;
  status: DocumentStatus;
}) {
  const [numPages, setNumPages] = useState<number>();
  const [currPage, setCurrPage] = useState(1);
  const [selectedComment, setSelectedComment] = useState<string>();

  const { data: comments, isLoading: getLoading } =
    trpc.document.getComments.useQuery({ documentId });

  const commentsList = comments?.reduce(
    (acc: Record<string, typeof comments>, item) => {
      const page = item.page;

      if (!acc[page]) {
        acc[page] = [];
      }

      acc[page].push(item);
      return acc;
    },
    {},
  );

  const validator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
  });

  type Validator = z.infer<typeof validator>;

  const form = useForm<Validator>({
    defaultValues: { page: '1' },
    resolver: zodResolver(validator),
  });

  return (
    <>
      <div className='col-span-1 border-r h-full border-gray-200 flex flex-col'>
        <h2 className='font-semibold text-lg'>Comment List</h2>
        <div className='flex pr-4 pt-4 flex-col flex-1'>
          {commentsList ? (
            <div className='flex flex-col gap-2 flex-grow h-0 overflow-y-auto'>
              {Object.entries(commentsList).map(([page, pageComments]) => (
                <div key={page} className='flex flex-col border-b'>
                  <p className='text-muted-foreground font-medium pb-1'>{`Page ${page}`}</p>
                  {pageComments.map((comment) => (
                    <Toggle
                      asChild
                      key={comment.id}
                      pressed={comment.id === selectedComment}
                      onPressedChange={() => {
                        setSelectedComment((prev) =>
                          prev === comment.id ? undefined : comment.id,
                        );
                        setCurrPage(comment.page);
                        form.setValue('page', comment.page.toString());
                      }}
                      className='flex p-2 hover:cursor-pointer justify-start h-full'>
                      <p className='break-all font-normal text-sm'>
                        &quot;{comment.content}&quot;
                      </p>
                    </Toggle>
                  ))}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <div className='col-span-3 xl:flex'>
        <div className='px-4 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6'>
          <PDFRenderer
            url={url}
            numPages={numPages}
            setNumPages={setNumPages}
            form={form}
            currPage={currPage}
            setCurrPage={setCurrPage}
          />
        </div>
      </div>

      <div className='border-t col-span-2 border-gray-200 lg:border-l lg:border-t-0'>
        <Comments
          getLoading={getLoading}
          comments={comments?.map((comment) => ({
            ...comment,
            createdAt: new Date(comment.createdAt),
            author: {
              ...comment.author,
              createdAt: new Date(comment.author.createdAt),
              updatedAt: new Date(comment.author.updatedAt),
            },
          }))}
          documentId={documentId}
          userRole={userRole}
          status={status}
          currPage={currPage}
          selectedComment={selectedComment}
        />
      </div>
    </>
  );
}
