'use client';

import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { capitalizeFirstLetter } from '@/helpers';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'name',
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
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date Added' />
    ),
    cell: ({ row }) => {
      console.log({ row });
      const date = format(new Date(row.original.createdAt), 'MMM dd, yyyy');
      return date;
    },
  },
  {
    id: 'action',
    enableSorting: false,
    enableHiding: false,
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem className='flex flex-row gap-2 items-center'>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className='flex flex-row gap-2 items-center'>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
