'use client';

import DataTable from '@/components/data-table';
import { columns } from '../columns';
import { trpc } from '@/app/_trpc/client';
import { Role } from '@prisma/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Ghost } from 'lucide-react';

export default function GroupsTable({
  userRole,
  userId,
}: {
  userRole: Role;
  userId: string;
}) {
  const { data, isLoading } = trpc.group.getAll.useQuery();

  const filteredGroup =
    userRole === 'ADVISER'
      ? data?.filter((group) => group.members.some((m) => m.id === userId))
      : data;

  return (
    <>
      {filteredGroup && filteredGroup.length > 0 ? (
        <DataTable
          data={filteredGroup.map((d) => ({
            ...d,
            createdAt: new Date(d.createdAt),
            updatedAt: new Date(d.updatedAt),
            members: d.members.map((m) => ({
              ...m,
              createdAt: new Date(m.createdAt),
              updatedAt: new Date(m.updatedAt),
            })),
          }))}
          columns={columns(userRole)}
        />
      ) : isLoading ? (
        <Skeleton className='w-full h-full' />
      ) : (
        <div className='flex flex-col items-center'>
          <Ghost className='h-8 w-8 text-gray-500' />
          <p className='text-gray-500 text-sm font-medium'>No Groups</p>
        </div>
      )}
    </>
  );
}
