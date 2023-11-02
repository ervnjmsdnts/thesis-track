'use client';

import DataTable from '@/components/data-table';
import { columns } from '../columns';
import { trpc } from '@/app/_trpc/client';
import UserTableToolbar from './table-toolbar';

export default function UserTable() {
  const { data } = trpc.user.getAll.useQuery();

  return (
    <div className='flex flex-col h-full'>
      {data && data.length !== 0 ? (
        <DataTable
          data={data.map((d) => ({
            ...d,
            createdAt: new Date(d.createdAt),
            updatedAt: new Date(d.updatedAt),
          }))}
          columns={columns}
          Toolbar={UserTableToolbar}
        />
      ) : null}
    </div>
  );
}
