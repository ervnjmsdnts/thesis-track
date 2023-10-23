'use client';

import { trpc } from '@/app/_trpc/client';
import MilestoneBar from '@/components/milestone-bar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function DashboardSkeleton() {
  return (
    <div className='flex flex-col h-full'>
      <div className='grid grid-cols-6 flex-grow grid-rows-4 gap-4'>
        <Skeleton className='col-span-4 row-span-2 h-full' />
        <Skeleton className='col-span-2 row-span-2 h-full' />
        <Skeleton className='col-span-2 row-span-2 h-full' />
        <Skeleton className='col-span-2 row-span-2 h-full' />
        <Skeleton className='col-span-2 row-span-2 h-full' />
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { data: userGroup, isLoading } = trpc.getCurrentUserGroup.useQuery();
  const { data: user } = trpc.getCurrentUser.useQuery(undefined, {
    enabled: !!userGroup?.id,
  });

  const myTasks = userGroup?.tasks.filter((t) => t.assigneeId === user?.id);
  const groupTasks = userGroup?.tasks;
  const groupPendingTasks = userGroup?.tasks.filter(
    (t) => t.status === 'PENDING',
  );
  const groupOngoingTasks = userGroup?.tasks.filter(
    (t) => t.status === 'ONGOING',
  );
  const groupCompletedTasks = userGroup?.tasks.filter(
    (t) => t.status === 'COMPLETE',
  );

  return (
    <>
      {userGroup && userGroup.id ? (
        <div className='flex flex-col h-full'>
          <div className='grid gap-4 grid-cols-6 grid-rows-4 h-full flex-grow'>
            <Card className='col-span-4 row-span-2 flex flex-col'>
              <CardHeader>
                <CardTitle className='text-3xl'>{userGroup.title}</CardTitle>
              </CardHeader>
              <CardContent className='flex flex-grow flex-col'>
                <MilestoneBar className='h-4 mt-8' percent={50} />
                <div className='flex gap-2 w-full h-full'>
                  <Card className='w-full shadow-none border-none'>
                    <div className='flex h-full items-center justify-center flex-col'>
                      <h3 className='font-semibold text-3xl'>
                        {groupTasks?.length}
                      </h3>
                      <p className='font-medium text-zinc-500 text-xl'>
                        Total Tasks
                      </p>
                    </div>
                  </Card>
                  <Card className='w-full border-none shadow-none'>
                    <div className='flex h-full items-center justify-center flex-col'>
                      <h3 className='font-semibold text-3xl'>
                        {groupPendingTasks?.length}
                      </h3>
                      <p className='font-medium text-zinc-500 text-xl'>
                        Pending Tasks
                      </p>
                    </div>
                  </Card>
                  <Card className='w-full border-none shadow-none'>
                    <div className='flex h-full items-center justify-center flex-col'>
                      <h3 className='font-semibold text-3xl'>
                        {groupOngoingTasks?.length}
                      </h3>
                      <p className='font-medium text-zinc-500 text-xl'>
                        Ongoing Tasks
                      </p>
                    </div>
                  </Card>
                  <Card className='w-full border-none shadow-none'>
                    <div className='flex h-full items-center justify-center flex-col'>
                      <h3 className='font-semibold text-3xl'>
                        {groupCompletedTasks?.length}
                      </h3>
                      <p className='font-medium text-zinc-500 text-xl'>
                        Completed Tasks
                      </p>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
            <Card className='col-span-2 row-span-2'>
              <CardHeader>
                <CardTitle className='text-zinc-600'>Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex flex-col gap-2'>
                  {userGroup.members.map((member) => (
                    <div
                      key={member.id}
                      className='p-4 border rounded-lg h-full'>
                      <div className='items-center flex gap-4'>
                        <Avatar className='ring-2'>
                          <AvatarFallback>
                            {member.firstName[0]}
                            {member.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className='font-medium'>
                            {member.firstName} {member.lastName}
                          </p>
                          <p className='text-sm text-zinc-500'>
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className='col-span-2 row-span-2'>
              <CardHeader>
                <CardTitle className='text-zinc-600'>Recent Activity</CardTitle>
              </CardHeader>
            </Card>
            <Card className='col-span-2 row-span-2'>
              <CardHeader>
                <CardTitle className='text-zinc-600'>
                  My Completed Tasks
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className='col-span-2 row-span-2'>
              <CardHeader>
                <CardTitle className='text-zinc-600'>
                  My Pending Tasks
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      ) : isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>No content</>
      )}
    </>
  );
}
