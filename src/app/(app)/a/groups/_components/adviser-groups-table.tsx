'use client';

import DataTable from '@/components/data-table';
import { columns } from '../columns';
import { trpc } from '@/app/_trpc/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Ghost } from 'lucide-react';
import { DataTablePagination } from '@/components/data-table-pagination';
import TableToolbar from './table-toolbar';

export default function AdviserGroupsTable({ userId }: { userId: string }) {
  const { data, isLoading } = trpc.group.getAll.useQuery();

  const filteredGroup = data?.filter((group) =>
    group.members.some((m) => m.id === userId),
  );

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
          columns={columns}
          Toolbar={TableToolbar}
          Pagination={DataTablePagination}
        />
      ) : isLoading ? (
        <Skeleton className='w-full bg-white h-full' />
      ) : (
        <div className='flex flex-col items-center'>
          <Ghost className='h-8 w-8 text-gray-500' />
          <p className='text-gray-500 text-sm font-medium'>No Groups</p>
        </div>
      )}
    </>
  );
}
