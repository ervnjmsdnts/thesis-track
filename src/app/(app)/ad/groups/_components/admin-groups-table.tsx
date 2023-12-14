'use client';

import DataTable from '@/components/data-table';
import { columns } from '../columns';
import { trpc } from '@/app/_trpc/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Ghost } from 'lucide-react';
import CreateGroupDialog from './create-group-dialog';
import TableToolbar from './table-toolbar';
import { DataTablePagination } from '@/components/data-table-pagination';

export default function AdminGroupsTable() {
  const { data: groups, isLoading } = trpc.group.getAll.useQuery();

  let groupTitles: (string | null)[] = [];

  if (groups && groups.length > 0) {
    groupTitles = groups.map((group) => group.title);
  }

  return (
    <div className='flex flex-col h-full'>
      {groups && groups.length > 0 ? (
        <DataTable
          data={groups.map((d) => ({
            ...d,
            createdAt: new Date(d.createdAt),
            updatedAt: new Date(d.updatedAt),
            members: d.members.map((m) => ({
              ...m,
              createdAt: new Date(m.createdAt),
              updatedAt: new Date(m.updatedAt),
            })),
          }))}
          CreateButtons={<CreateGroupDialog groupTitles={groupTitles} />}
          Toolbar={TableToolbar}
          Pagination={DataTablePagination}
          columns={columns}
        />
      ) : isLoading ? (
        <Skeleton className='w-full bg-white h-full' />
      ) : (
        <div className='flex flex-col items-center'>
          <Ghost className='h-8 w-8 text-gray-500' />
          <p className='text-gray-500 text-sm font-medium'>No Groups</p>
        </div>
      )}
    </div>
  );
}
