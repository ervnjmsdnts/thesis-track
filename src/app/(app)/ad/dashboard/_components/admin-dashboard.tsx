'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Groups from './groups';
import PendingApprovals from './pending-approvals';
import CollectionMilestone from '@/components/collection-milestone';
import { trpc } from '@/app/_trpc/client';

export default function AdminDashboard({ userId }: { userId: string }) {
  const { data: groups } = trpc.group.getAll.useQuery();
  return (
    <div className='flex flex-col h-full'>
      <div className='grid grid-cols-7 flex-grow gap-4 h-full'>
        <div className='col-span-5'>
          <Card className='h-full flex flex-col'>
            <CardHeader>
              <CardTitle className='text-lg'>Groups</CardTitle>
            </CardHeader>
            <CardContent className='flex-col flex flex-grow'>
              <Groups userId={userId} />
            </CardContent>
          </Card>
        </div>
        <div className='col-span-2 grid gap-4'>
          <Card className='row-span-1'>
            <CardHeader>
              <CardTitle className='text-lg'>
                Collection of Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className='flex justify-center items-center'>
              <CollectionMilestone
                groups={groups?.map((group) => ({
                  ...group,
                  createdAt: new Date(group.createdAt),
                  updatedAt: new Date(group.updatedAt),
                }))}
              />
            </CardContent>
          </Card>
          <Card className='flex flex-col row-span-6'>
            <CardHeader>
              <CardTitle className='text-lg'>Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col flex-grow'>
              <PendingApprovals />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
