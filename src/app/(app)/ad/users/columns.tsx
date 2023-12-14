'use client';

import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { capitalizeFirstLetter } from '@/helpers';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Section, User } from '@prisma/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import UpdateRole from './_components/update-role';
import UpdateAssignedSections from './_components/update-assigned-sections';
import UpdateStudentSection from './_components/update-student-section';

export const columns: ColumnDef<
  User & { section: Section | null; assignedSections: Section[] }
>[] = [
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
            <AvatarImage src={row.original?.picture as string | undefined} />
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
      if (role === 'ADMIN')
        return (
          <Badge className='bg-purple-500'>{capitalizeFirstLetter(role)}</Badge>
        );

      return null;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
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
    accessorKey: 'assignedSections',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Assigned Sections' />
    ),
    cell: ({ row }) => {
      const sections = row.original.assignedSections;

      return (
        <div className='grid grid-cols-2 gap-1'>
          {sections.map((section) => (
            <Badge key={section.id} className='text-center justify-center'>
              {section.name}
            </Badge>
          ))}
        </div>
      );
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
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      if (row.original.role === 'ADMIN') return;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <UpdateRole
              userId={row.original.id}
              currentRole={row.original.role!}
            />
            {row.original.role === 'STUDENT' ? (
              <UpdateStudentSection
                userId={row.original.id}
                currSectionId={row.original.sectionId!}
              />
            ) : null}
            {row.original.role === 'INSTRUCTOR' ? (
              <UpdateAssignedSections
                instructorId={row.original.id}
                assignedSections={row.original.assignedSections}
              />
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
