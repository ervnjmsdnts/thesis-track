'use client';

import DataTable from '@/components/data-table';
import { columns } from '../columns';
import { trpc } from '@/app/_trpc/client';

export default function GroupsTable() {
  const { data } = trpc.group.getAll.useQuery();

  if (!data) return;

  return (
    <DataTable
      data={data.map((d) => ({
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
    />
  );
}
