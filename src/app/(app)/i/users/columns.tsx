'use client';

import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { capitalizeFirstLetter } from '@/helpers';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Section, User } from '@prisma/client';

export const columns: ColumnDef<User & { section: Section | null }>[] = [
  {
    id: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const firstName = row.original?.firstName;
      const lastName = row.original?.lastName;

      const name = `${firstName} ${lastName}`;
      const fallback = `${firstName?.[0]}${lastName?.[0]}`;

      return (
        <div className='flex items-center font-medium gap-2'>
          <Avatar>
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          <p>{name}</p>
        </div>
      );
    },
    filterFn: (row, _, value) => {
      const name =
        `${row.original.firstName} ${row.original.lastName}`.toLowerCase();

      return name.includes(value.toLowerCase());
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email Address' />
    ),
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ row }) => {
      const role = row.original?.role;

      if (role === 'INSTRUCTOR')
        return <Badge>{capitalizeFirstLetter(role)}</Badge>;
      if (role === 'ADVISER')
        return (
          <Badge className='bg-yellow-500'>{capitalizeFirstLetter(role)}</Badge>
        );
      if (role === 'STUDENT')
        return (
          <Badge className='bg-green-500'>{capitalizeFirstLetter(role)}</Badge>
        );

      return null;
    },
  },
  {
    accessorKey: 'section.name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Section' />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date Added' />
    ),
    cell: ({ row }) => {
      const date = format(new Date(row.original.createdAt), 'MMM dd, yyyy');
      return date;
    },
  },
];
