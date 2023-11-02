'use client';

import { trpc } from '@/app/_trpc/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Ghost } from 'lucide-react';
import UploadButton from './upload-button';
import DocumentCard from './document-card';

export default function Approval() {
  const { data: groupDocuments, isLoading } =
    trpc.document.groupDocuments.useQuery();

  return (
    <main>
      <div className='flex items-center justify-between mb-4'>
        <h1 className='text-xl font-semibold'>Group Documents</h1>
        <UploadButton />
      </div>
      {groupDocuments && groupDocuments.length > 0 ? (
        <div className='grid grid-cols-3 gap-4'>
          {groupDocuments
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .map((document, index) => (
              <DocumentCard
                id={document.id}
                file={document.file}
                comments={document.comments.map((item) => ({
                  ...item,
                  createdAt: new Date(item.createdAt),
                }))}
                createdAt={new Date(document.createdAt)}
                status={document.status}
                key={index}
              />
            ))}
        </div>
      ) : isLoading ? (
        <div className='grid-cols-1 grid gap-2'>
          {new Array(3).fill('').map((_, index) => (
            <Skeleton key={index} className='rounded-lg p-16' />
          ))}
        </div>
      ) : (
        <div className='flex flex-col items-center gap-2'>
          <Ghost className='h-8 w-8 text-zinc-800' />
          <h3 className='font-semibold text-xl'>Upload your first document</h3>
        </div>
      )}
    </main>
  );
}