'use client';

import DataTable from '@/components/data-table';
import { columns } from '../columns';
import { trpc } from '@/app/_trpc/client';
import { Role } from '@prisma/client';

export default function GroupsTable({
  userRole,
  userId,
}: {
  userRole: Role;
  userId: string;
}) {
  const { data } = trpc.group.getAll.useQuery();

  if (!data) return;

  const filteredGroup =
    userRole === 'ADVISER'
      ? data.filter((group) => group.members.some((m) => m.id === userId))
      : data;

  return (
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
  );
}
