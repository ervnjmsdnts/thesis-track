'use client';

import { trpc } from '@/app/_trpc/client';
import MilestoneBar from '@/components/milestone-bar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import UserInfo from '@/components/user-info';
import { cn } from '@/lib/utils';
import { User } from '@prisma/client';
import { Ghost } from 'lucide-react';

function Group({
  users,
  title,
  milestone,
}: {
  users: User[];
  title: string;
  milestone: string;
}) {
  const maxItems = 4;
  return (
    <div className='border p-3 rounded-lg'>
      <div className='flex items-center justify-between'>
        <h3 className='truncate font-medium w-96'>{title}</h3>
        <Popover>
          <PopoverTrigger>
            <div className='flex -space-x-2'>
              {users
                .slice(0, maxItems)
                .map(({ firstName, lastName, role }, index) => (
                  <Avatar
                    key={index}
                    className={cn(
                      'ring-2 ring-primary',
                      role === 'ADVISER' && 'ring-green-500',
                    )}>
                    <AvatarFallback>
                      {firstName[0]}
                      {lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                ))}
              {users.length > maxItems && (
                <Avatar className='ring-2 ring-primary'>
                  <AvatarFallback>+{users.length - maxItems}</AvatarFallback>
                </Avatar>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent>
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
        <div className='max-w-xs w-full'>
          <MilestoneBar milestone={milestone} />
        </div>
      </div>
    </div>
  );
}

export default function Groups({ userId }: { userId: string }) {
  const { data: groups, isLoading } = trpc.group.getAll.useQuery();

  return (
    <div className='flex flex-col h-0 overflow-y-auto flex-grow gap-4'>
      {groups && groups.length !== 0 ? (
        <>
          {groups.map((group) => (
            <Group
              key={group.id}
              title={group.title!}
              milestone={group.progression}
              users={group.members
                .filter((member) => member.role === 'STUDENT')
                .map((member) => ({
                  ...member,
                  createdAt: new Date(member.createdAt),
                  updatedAt: new Date(member.updatedAt),
                }))}
            />
          ))}
        </>
      ) : isLoading ? (
        <div className='flex gap-4 flex-col items-center justify-center'>
          <Skeleton className='p-8 w-full' />
          <Skeleton className='p-8 w-full' />
          <Skeleton className='p-8 w-full' />
        </div>
      ) : (
        <div className='flex flex-col items-center'>
          <Ghost className='h-8 w-8 text-gray-500' />
          <p className='text-gray-500 text-sm font-medium'>No Groups</p>
        </div>
      )}
    </div>
  );
}
