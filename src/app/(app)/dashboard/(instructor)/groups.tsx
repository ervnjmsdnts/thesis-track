'use client';

import { trpc } from '@/app/_trpc/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import UserInfo from '@/components/user-info';
import { User } from '@prisma/client';
import { Loader2 } from 'lucide-react';

function MilestoneBar() {
  return (
    <div className='h-2 relative w-full rounded-full bg-zinc-300'>
      <div className='absolute rounded-full bg-green-400 w-[10%] h-2'></div>
      <p className='text-xs pt-2 text-zinc-400 text-center'>Proposal Defense</p>
    </div>
  );
}

function Group({ users, title }: { users: User[]; title: string }) {
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
                .map(({ firstName, lastName }, index) => (
                  <Avatar key={index} className='ring-2 ring-primary'>
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
          <MilestoneBar />
        </div>
      </div>
    </div>
  );
}

export default function Groups() {
  const { data: groups, isLoading } = trpc.getGroups.useQuery();

  return (
    <div className='flex flex-col h-0 overflow-y-auto flex-grow gap-4'>
      {groups && groups.length !== 0 ? (
        <>
          {groups.map((group) => (
            <Group
              key={group.id}
              title={group.title!}
              users={group.members.map((member) => ({
                ...member,
                createdAt: new Date(member.createdAt),
                updatedAt: new Date(member.updatedAt),
              }))}
            />
          ))}
        </>
      ) : isLoading ? (
        <div className='flex items-center justify-center'>
          <Loader2 className='w-8 h-8 animate-spin' />
        </div>
      ) : (
        <div>No content</div>
      )}
    </div>
  );
}
