'use client';

import { trpc } from '@/app/_trpc/client';
import MilestoneBar from '@/components/milestone-bar';
import PriorityBadge from '@/components/priority-badge';
import TypeBadge from '@/components/type-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Task } from '@prisma/client';
import { format } from 'date-fns';
import { Clock, Ghost } from 'lucide-react';

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

function DashboardTask({ task }: { task: Task }) {
  return (
    <Card>
      <CardHeader className='flex flex-row gap-4 items-center'>
        <CardTitle className='text-xl'>{task.title}</CardTitle>
        <div className='flex gap-2'>
          <PriorityBadge priority={task.priority} />
          <TypeBadge type={task.type} />
        </div>
      </CardHeader>
      <CardFooter>
        <div className='flex text-zinc-500 text-sm items-center gap-2'>
          <Clock className='h-4 w-4' />
          <p>{format(new Date(task.dueDate), 'PP')}</p>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function StudentDashboard() {
  const { data: userGroup, isLoading } = trpc.group.getCurrent.useQuery();
  const { data: user } = trpc.user.getCurrent.useQuery(undefined, {
    enabled: !!userGroup?.id,
  });

  const myTasks = userGroup?.tasks.filter((t) => t.assigneeId === user?.id);
  const myPendingTasks = myTasks?.filter((t) => t.status === 'PENDING');
  const myOngoingTasks = myTasks?.filter((t) => t.status === 'ONGOING');
  const myCompletedTasks = myTasks?.filter((t) => t.status === 'COMPLETE');
  const adviser = userGroup?.members.find((m) => m.role === 'ADVISER');
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
  const studentsInGroup = userGroup?.members.filter(
    (member) => member.role === 'STUDENT',
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
            <Card className='col-span-2 row-span-1 flex flex-col'>
              <CardHeader>
                <CardTitle className='text-zinc-600'>Members</CardTitle>
              </CardHeader>
              <CardContent className='flex flex-col flex-grow h-0 overflow-y-auto'>
                <div className='flex flex-col gap-2'>
                  {userGroup.members
                    .filter((member) => member.role === 'STUDENT')
                    .map((member) => (
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
                              {member.email} | {member.section?.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            <Card className='col-span-2 row-span-1 flex flex-col'>
              <CardHeader>
                <CardTitle className='text-zinc-600'>Adviser</CardTitle>
              </CardHeader>
              {adviser?.id && adviser ? (
                <CardContent className='flex flex-col flex-grow h-0 overflow-y-auto'>
                  <div className='p-4 border rounded-lg h-full'>
                    <div className='items-center flex gap-4'>
                      <Avatar className='ring-2'>
                        <AvatarFallback>
                          {adviser.firstName[0]}
                          {adviser.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className='font-medium'>
                          {adviser.firstName} {adviser.lastName}
                        </p>
                        <p className='text-sm text-zinc-500'>{adviser.email}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              ) : null}
            </Card>
            <Card className='col-span-2 row-span-2 flex flex-col'>
              <CardHeader>
                <CardTitle className='text-zinc-600'>
                  My Pending Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className='flex-grow h-0 flex flex-col gap-2 overflow-y-auto'>
                {myPendingTasks && myPendingTasks.length > 0 ? (
                  <>
                    {myPendingTasks.map((task) => (
                      <DashboardTask
                        key={task.id}
                        task={{
                          ...task,
                          createdAt: new Date(task.createdAt),
                          updatedAt: new Date(task.updatedAt),
                          dueDate: new Date(task.dueDate),
                        }}
                      />
                    ))}
                  </>
                ) : (
                  <div className='flex flex-col items-center'>
                    <Ghost className='h-8 w-8 text-gray-500' />
                    <p className='text-gray-500 text-sm font-medium'>
                      No Pending Tasks
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className='col-span-2 row-span-2 flex flex-col'>
              <CardHeader>
                <CardTitle className='text-zinc-600'>
                  My Ongoing Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className='flex-grow h-0 flex flex-col gap-2 overflow-y-auto'>
                {myOngoingTasks && myOngoingTasks.length > 0 ? (
                  <>
                    {myOngoingTasks.map((task) => (
                      <DashboardTask
                        key={task.id}
                        task={{
                          ...task,
                          createdAt: new Date(task.createdAt),
                          updatedAt: new Date(task.updatedAt),
                          dueDate: new Date(task.dueDate),
                        }}
                      />
                    ))}
                  </>
                ) : (
                  <div className='flex flex-col items-center'>
                    <Ghost className='h-8 w-8 text-gray-500' />
                    <p className='text-gray-500 text-sm font-medium'>
                      No Ongoing Tasks
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className='col-span-2 row-span-2 flex flex-col'>
              <CardHeader>
                <CardTitle className='text-zinc-600'>
                  My Completed Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className='flex-grow h-0 flex flex-col gap-2 overflow-y-auto'>
                {myCompletedTasks && myCompletedTasks.length > 0 ? (
                  <>
                    {myCompletedTasks.map((task) => (
                      <DashboardTask
                        key={task.id}
                        task={{
                          ...task,
                          createdAt: new Date(task.createdAt),
                          updatedAt: new Date(task.updatedAt),
                          dueDate: new Date(task.dueDate),
                        }}
                      />
                    ))}
                  </>
                ) : (
                  <div className='flex flex-col items-center'>
                    <Ghost className='h-8 w-8 text-gray-500' />
                    <p className='text-gray-500 text-sm font-medium'>
                      No Completed Tasks
                    </p>
                  </div>
                )}
              </CardContent>
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
