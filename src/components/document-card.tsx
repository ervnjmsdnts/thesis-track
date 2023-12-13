'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { MessageSquareIcon, Plus } from 'lucide-react';
import { DocumentStatusBadge } from './document-status';
import { useRouter } from 'next/navigation';
import { Comment, DocumentStatus, Role } from '@prisma/client';

export default function DocumentCard({
  id,
  file,
  createdAt,
  comments,
  status,
  role,
}: {
  id: string;
  file: string;
  createdAt: Date;
  comments: Comment[];
  status: DocumentStatus;
  role: Role;
}) {
  const router = useRouter();
  // if (role === 'STUDENT') {
  //           router.push('/s');
  //         }
  //         if (role === 'ADVISER') {
  //           router.push('/a');
  //         }
  //         if (role === 'INSTRUCTOR') {
  //           router.push('/i');
  //         }
  //         if (role === 'ADMIN') {
  //           router.push('/ad');
  //         }

  return (
    <Card
      onClick={() =>
        router.push(
          `${
            role === 'STUDENT' ? '/s' : role === 'ADVISER' ? '/a' : '/i'
          }/approval/${id}`,
        )
      }
      className='hover:shadow-lg cursor-pointer'>
      <CardHeader>
        <CardTitle className='text-xl truncate'>{file}</CardTitle>
      </CardHeader>
      <Separator className='mb-4' />
      <CardContent className='flex flex-row justify-between items-center'>
        <div className='flex items-center gap-2'>
          <Plus className='w-4 h-4' />{' '}
          <span>{format(new Date(createdAt), 'PP')}</span>
        </div>
        <div className='flex items-center gap-2'>
          <MessageSquareIcon className='w-4 h-4' />
          <span>{comments.length}</span>
        </div>
        <DocumentStatusBadge status={status} />
      </CardContent>
    </Card>
  );
}
