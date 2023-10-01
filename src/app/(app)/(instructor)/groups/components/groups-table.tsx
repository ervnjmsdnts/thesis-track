'use client';

import DataTable from '@/components/data-table';
import { columns } from '../columns';
import { trpc } from '@/app/_trpc/client';

export default function GroupsTable() {
  const { data } = trpc.getGroups.useQuery();

  if (!data) return;

  return <DataTable data={data} columns={columns} />;
}
