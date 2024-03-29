import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Group, Role, User } from '@prisma/client';
import UserInfo from '@/components/user-info';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import ChangeProgressionDialog from '@/components/change-progression-dialog';

export const columns: ColumnDef<Group & { members: User[] }>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Thesis Title' />
    ),
    cell: ({ row }) => <p className='font-semibold'>{row.original.title}</p>,
  },
  {
    accessorKey: 'progression',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Progression' />
    ),
    cell: ({ row }) => <p>{row.original.progression}</p>,
  },
  {
    accessorKey: 'users',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Students' />
    ),
    cell: ({ row }) => {
      const maxUsers = 4;
      const users = row.original.members.filter((m) => m.role === 'STUDENT');

      return (
        <Popover>
          <PopoverTrigger>
            <div className='flex -space-x-2'>
              {users.slice(0, maxUsers).map((user, index) => {
                const fallback = `${user.firstName[0]}${user.lastName[0]}`;
                return (
                  <Avatar
                    key={index}
                    className={cn(
                      'ring-2 ring-primary',
                      user.role === 'ADVISER' && 'ring-green-500',
                    )}>
                    <AvatarImage src={user?.picture as string | undefined} />
                    <AvatarFallback>{fallback}</AvatarFallback>
                  </Avatar>
                );
              })}
              {users.length > maxUsers && (
                <Avatar className='ring-2 ring-primary'>
                  <AvatarFallback>+{users.length - maxUsers}</AvatarFallback>
                </Avatar>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className='w-80'>
            <div className='flex flex-col gap-2'>
              {users.map((user) => {
                const name = `${user.firstName} ${user.lastName}`;
                const fallback = `${user.firstName[0]}${user.lastName[0]}`;
                return (
                  <UserInfo
                    key={user.id}
                    picture={user.picture}
                    email={user.email}
                    name={name}
                    fallback={fallback}
                  />
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      );
    },
    enableSorting: false,
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
            <ChangeProgressionDialog
              currProgress={row.original.progression}
              groupId={row.original.id}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
