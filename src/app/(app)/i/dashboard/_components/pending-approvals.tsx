'use client';
import { trpc } from '@/app/_trpc/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Ghost } from 'lucide-react';
import Link from 'next/link';

function Approval({
  title,
  submitDate,
  fileName,
  fileId,
}: {
  title: string;
  submitDate: Date;
  fileName: string;
  fileId: string;
}) {
  return (
    <div className='border p-3 rounded-lg'>
      <div className='flex items-center justify-between'>
        <div>
          <h4 className='font-medium max-w-[14rem] truncate'>{title}</h4>
          <p className='text-zinc-500 text-sm font-medium max-w-[14rem] truncate'>
            {fileName}
          </p>
          <p className='text-zinc-500 text-xs'>
            Submitted: {format(submitDate, 'PPp')}
          </p>
        </div>
        <Button asChild>
          <Link href={`/i/approval/${fileId}`}>View</Link>
        </Button>
      </div>
    </div>
  );
}

export default function PendingApprovals() {
  const { data: documents, isLoading } =
    trpc.document.staffGetPendingDocuments.useQuery();

  return (
    <div className='flex flex-col flex-grow h-0 overflow-y-auto gap-4'>
      {documents && documents.length > 0 ? (
        <>
          {documents
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .map((doc) => (
              <Approval
                key={doc.id}
                title={doc.group.title!}
                submitDate={new Date(doc.createdAt)}
                fileName={doc.file}
                fileId={doc.id}
              />
            ))}
        </>
      ) : isLoading ? (
        <div className='flex gap-4 flex-col items-center justify-center'>
          <Skeleton className='p-8 w-full' />
          <Skeleton className='p-8 w-full' />
          <Skeleton className='p-8 w-full' />
        </div>
      ) : (
        <div className='flex flex-col items-center'>
          <Ghost className='h-8 w-8 text-gray-500' />
          <p className='text-gray-500 text-sm font-medium'>
            No Pending Approvals
          </p>
        </div>
      )}
    </div>
  );
}
