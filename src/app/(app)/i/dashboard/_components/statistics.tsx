'use client';

import { trpc } from '@/app/_trpc/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Ghost } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

function Stats({
  label,
  length,
  href,
}: {
  label: string;
  length: number;
  href: string;
}) {
  return (
    <div className='border p-4 rounded-lg'>
      <div className='flex items-center justify-between'>
        <Button asChild variant='link' className='p-0 text-md font-semibold'>
          <Link href={href}>{label}</Link>
        </Button>
        <p>{length}</p>
      </div>
    </div>
  );
}

export default function Statistics() {
  const { data: users, isLoading: usersLoading } =
    trpc.user.getBasedOnAssignedSection.useQuery();
  const { data: groups, isLoading: groupsLoading } =
    trpc.group.getBasedOnAssignedSection.useQuery();

  const isLoading = useMemo(
    () => usersLoading || groupsLoading,
    [usersLoading, groupsLoading],
  );

  const hasData = users && users.length > 0 && groups && groups.length > 0;

  return (
    <div className='flex flex-col flex-grow h-0 overflow-y-auto gap-4'>
      {hasData ? (
        <>
          <Stats label='Users' length={users.length} href='/i/users' />
          <Stats label='Groups' length={groups.length} href='/i/groups' />
        </>
      ) : isLoading ? (
        <div className='flex gap-4 flex-col items-center h-full justify-center'>
          <Skeleton className='p-8 w-full h-full' />
          <Skeleton className='p-8 w-full h-full' />
        </div>
      ) : (
        <div className='flex flex-col items-center'>
          <Ghost className='h-8 w-8 text-gray-500' />
          <p className='text-gray-500 text-sm font-medium'>
            No Pending Approvals
          </p>
        </div>
      )}
    </div>
  );
}
