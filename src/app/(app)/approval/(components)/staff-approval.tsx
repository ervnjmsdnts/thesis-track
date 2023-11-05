'use client';

import { trpc } from '@/app/_trpc/client';
import { Comment, Document, Role } from '@prisma/client';
import { Ghost } from 'lucide-react';
import { useState } from 'react';
import DocumentCard from './document-card';
import { Skeleton } from '@/components/ui/skeleton';
import GroupFilter from '@/components/group-filter';

function DocumentList({
  documents,
}: {
  documents: (Document & { comments: Comment[] })[];
}) {
  if (!documents || documents.length === 0) {
    return null;
  }
  return (
    <div className='grid grid-cols-3 gap-2'>
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          id={doc.id}
          comments={doc.comments.map((c) => ({
            ...c,
            createdAt: new Date(c.createdAt),
          }))}
          file={doc.file}
          createdAt={new Date(doc.createdAt)}
          status={doc.status}
        />
      ))}
    </div>
  );
}

export default function StaffApproval({
  userRole,
  userId,
}: {
  userRole: Role;
  userId: string;
}) {
  const { data, isLoading } = trpc.group.getAll.useQuery();

  const [selectedGroup, setSelectedGroup] = useState<string>();

  const filteredGroup =
    userRole === 'ADVISER'
      ? data?.filter((group) => group.members.some((m) => m.id === userId))
      : data;

  const documents = filteredGroup?.flatMap((group) =>
    group.documents.filter((doc) => doc.groupId === selectedGroup),
  );

  return (
    <div className='flex w-full h-full'>
      <GroupFilter
        filteredGroup={filteredGroup?.map((g) => ({
          ...g,
          createdAt: new Date(g.createdAt),
          updatedAt: new Date(g.updatedAt),
        }))}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
      />
      <div className='flex-1 pl-4 w-full'>
        {filteredGroup &&
        filteredGroup.length > 0 &&
        selectedGroup &&
        documents &&
        documents.length > 0 ? (
          <DocumentList
            documents={documents
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )
              .map((doc) => ({
                ...doc,
                createdAt: new Date(doc.createdAt),
                comments: doc.comments.map((c) => ({
                  ...c,
                  createdAt: new Date(c.createdAt),
                })),
              }))}
          />
        ) : isLoading ? (
          <div className='grid-cols-1 grid gap-2'>
            {new Array(3).fill('').map((_, index) => (
              <Skeleton key={index} className='rounded-lg p-16' />
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center gap-2 mt-16'>
            <Ghost className='h-8 w-8 text-zinc-800' />
            <h3 className='font-semibold text-xl'>No Selected Group</h3>
          </div>
        )}
      </div>
    </div>
  );
}
