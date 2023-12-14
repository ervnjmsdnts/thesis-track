'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Groups from './groups';
import { trpc } from '@/app/_trpc/client';
import CollectionMilestone from '@/components/collection-milestone';
import Statistics from './statistics';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function InstructorDashboard({ userId }: { userId: string }) {
  const { data: groups, isLoading } =
    trpc.group.getBasedOnAssignedSection.useQuery();

  const router = useRouter();
  return (
    <div className='flex flex-col h-full'>
      <div className='grid grid-cols-7 flex-grow gap-4 h-full'>
        <div className='col-span-5'>
          <Card className='h-full flex flex-col'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-lg'>Groups</CardTitle>
                <Button
                  onClick={() => router.push('/i/groups')}
                  variant='link'
                  className='px-2'>
                  See more
                </Button>
              </div>
            </CardHeader>
            <CardContent className='flex-col flex flex-grow'>
              <Groups />
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
              <CardTitle className='text-lg'>Statistics</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col flex-grow'>
              <Statistics />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
