import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Group, Role, User } from '@prisma/client';
import UserInfo from '@/components/user-info';

export const columns = (
  userRole: Role,
): ColumnDef<Group & { members: User[] }>[] => {
  return [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Thesis Title' />
      ),
      cell: ({ row }) => <p className='font-semibold'>{row.original.title}</p>,
    },
    {
      accessorKey: 'users',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Students' />
      ),
      cell: ({ row }) => {
        const maxUsers = 4;
        const users =
          userRole === 'ADVISER'
            ? row.original.members.filter((m) => m.role === 'STUDENT')
            : row.original.members;

        return (
          <Popover>
            <PopoverTrigger>
              <div className='flex -space-x-2'>
                {users.slice(0, maxUsers).map((user, index) => {
                  const fallback = `${user.firstName[0]}${user.lastName[0]}`;
                  return (
                    <Avatar key={index} className='ring-2 ring-primary'>
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
        console.log({ row });
        const date = format(new Date(row.original.createdAt), 'MMM dd, yyyy');
        return date;
      },
    },
  ];
};
