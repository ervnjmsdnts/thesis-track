'use client';

import { trpc } from '@/app/_trpc/client';
import MilestoneBar from '@/components/milestone-bar';
import PriorityBadge from '@/components/priority-badge';
import TypeBadge from '@/components/type-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Task } from '@prisma/client';
import { format } from 'date-fns';
import {
  Check,
  Clock,
  Ghost,
  Loader2,
  MailPlus,
  Trash2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import AdviserInviteButton from './adviser-invite-button';
import StudentInviteButton from './student-invite-button';

function DashboardSkeleton() {
  return (
    <div className='flex flex-col h-full'>
      <div className='grid grid-cols-6 flex-grow grid-rows-4 gap-4'>
        <Skeleton className='col-span-4 bg-white row-span-2 h-full' />
        <Skeleton className='col-span-2 bg-white row-span-2 h-full' />
        <Skeleton className='col-span-2 bg-white row-span-2 h-full' />
        <Skeleton className='col-span-2 bg-white row-span-2 h-full' />
        <Skeleton className='col-span-2 bg-white row-span-2 h-full' />
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

export default function StudentDashboard({
  groupId,
  userId,
}: {
  groupId: string;
  userId: string;
}) {
  const { data: userGroup, isLoading } = trpc.group.getCurrent.useQuery();
  const [openAdviserRequest, setOpenAdviserRequest] = useState(false);
  const [openStudentRequest, setOpenStudentRequest] = useState(false);

  const utils = trpc.useUtils();

  const { toast } = useToast();

  const { data: joinRequests, isLoading: requestsLoading } =
    trpc.joinRequest.getJoinRequests.useQuery({ groupId: groupId });

  const { mutate: acceptRequest, isLoading: acceptLoading } =
    trpc.joinRequest.acceptRequest.useMutation({
      onSuccess: ({ user }) => {
        toast({
          title: 'Request Accepted',
          description: `${user.firstName} ${user.lastName} has been accepted`,
        });
        utils.group.getCurrent.invalidate();
        utils.joinRequest.getJoinRequests.invalidate();
        setOpenAdviserRequest(false);
        setOpenStudentRequest(false);
      },
    });

  const { mutate: rejectRequest, isLoading: rejectLoading } =
    trpc.joinRequest.rejectRequest.useMutation({
      onSuccess: ({ user }) => {
        toast({
          title: 'Request Rejected',
          description: `${user.firstName} ${user.lastName} has been rejected`,
        });
        utils.group.getCurrent.invalidate();
        utils.joinRequest.getJoinRequests.invalidate();
        setOpenAdviserRequest(false);
        setOpenStudentRequest(false);
      },
    });

  const { mutate: deleteRequest, isLoading: deleteLoading } =
    trpc.joinRequest.deleteRequest.useMutation({
      onSuccess: () => {
        utils.joinRequest.getJoinRequests.invalidate();
      },
    });

  const myTasks = userGroup?.tasks.filter((t) => t.assigneeId === userId);
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

  const studentRequests = joinRequests
    ?.filter((request) => request.user.role === 'STUDENT')
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  const adviserRequests = joinRequests
    ?.filter((request) => request.user.role === 'ADVISER')
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const hasPendingAdviserRequests = adviserRequests?.some(
    (request) => request.status === 'PENDING',
  );
  const hasPendingStudentRequests = studentRequests?.some(
    (request) => request.status === 'PENDING',
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
                <MilestoneBar
                  className='h-4 mt-8'
                  milestone={userGroup.progression}
                />
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
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-zinc-600'>Members</CardTitle>
                  <div className='flex items-center gap-2 h-full'>
                    <Popover
                      open={openStudentRequest}
                      onOpenChange={setOpenStudentRequest}>
                      <PopoverTrigger className='relative'>
                        {hasPendingStudentRequests ? (
                          <span className='flex h-3 w-3 z-10 right-0 absolute'>
                            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75'></span>
                            <span className='relative inline-flex rounded-full h-3 w-3 bg-primary'></span>
                          </span>
                        ) : null}
                        <Avatar>
                          <AvatarFallback>
                            <MailPlus className='text-muted-foreground w-5 h-5' />
                          </AvatarFallback>
                        </Avatar>
                      </PopoverTrigger>
                      <PopoverContent
                        align='end'
                        className='max-h-64 w-[400px] flex flex-col h-full'>
                        <div className='flex-grow overflow-y-auto flex flex-col gap-2'>
                          {studentRequests && studentRequests.length > 0 ? (
                            <>
                              {studentRequests.map(
                                ({ id, user, createdAt, status }) => (
                                  <div
                                    key={id}
                                    className='border rounded-sm p-2'>
                                    <div className='flex items-center gap-2 justify-between'>
                                      <div className='grid gap-1'>
                                        <p className='text-sm'>
                                          <span className='font-medium'>
                                            {user.firstName} {user.lastName}
                                          </span>{' '}
                                          {status === 'APPROVED'
                                            ? 'request has been accept'
                                            : status === 'REJECTED'
                                            ? 'request has been rejected'
                                            : 'has requested to join your group'}
                                        </p>
                                        <p className='text-xs text-muted-foreground'>
                                          {format(new Date(createdAt), 'PPp')}
                                        </p>
                                      </div>
                                      {status === 'PENDING' ? (
                                        <div className='flex items-center gap-1'>
                                          <Button
                                            variant='outline'
                                            disabled={
                                              acceptLoading || rejectLoading
                                            }
                                            onClick={() =>
                                              acceptRequest({
                                                groupId,
                                                requestId: id,
                                                userRequestId: user.id,
                                              })
                                            }
                                            className='rounded-full hover:bg-green-300 group h-8 w-8 p-0'>
                                            {acceptLoading ? (
                                              <Loader2 className='h-4 w-4 animate-spin' />
                                            ) : (
                                              <Check className='h-4 w-4 group-hover:text-green-800' />
                                            )}
                                          </Button>
                                          <Button
                                            variant='outline'
                                            disabled={
                                              acceptLoading || rejectLoading
                                            }
                                            onClick={() =>
                                              rejectRequest({
                                                requestId: id,
                                              })
                                            }
                                            className='rounded-full hover:bg-red-300 group h-8 w-8 p-0'>
                                            {rejectLoading ? (
                                              <Loader2 className='h-4 w-4 animate-spin' />
                                            ) : (
                                              <X className='h-4 w-4 group-hover:text-red-800' />
                                            )}
                                          </Button>
                                        </div>
                                      ) : (
                                        <Button
                                          variant='outline'
                                          disabled={deleteLoading}
                                          onClick={() =>
                                            deleteRequest({ requestId: id })
                                          }
                                          className='rounded-full h-8 w-8 p-0 hover:bg-red-300 group'>
                                          {deleteLoading ? (
                                            <Loader2 className='h-4 w-4 animate-spin' />
                                          ) : (
                                            <Trash2 className='h-4 w-4 group-hover:text-red-800' />
                                          )}
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ),
                              )}
                            </>
                          ) : requestsLoading ? (
                            <div className='flex justify-center py-4'>
                              <Loader2 className='animate-spin' />
                            </div>
                          ) : (
                            <div className='flex flex-col items-center'>
                              <Ghost className='h-6 w-6 text-gray-500' />
                              <p className='text-gray-500 text-sm font-medium'>
                                No Join Requests
                              </p>
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <StudentInviteButton />
                  </div>
                </div>
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
                          <Avatar>
                            <AvatarImage
                              src={member.picture as string | undefined}
                            />
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
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-zinc-600'>Adviser</CardTitle>
                  <div className='flex items-center gap-2 h-full'>
                    <Popover
                      open={openAdviserRequest}
                      onOpenChange={setOpenAdviserRequest}>
                      <PopoverTrigger className='relative'>
                        {hasPendingAdviserRequests ? (
                          <span className='flex h-3 w-3 z-10 right-0 absolute'>
                            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75'></span>
                            <span className='relative inline-flex rounded-full h-3 w-3 bg-primary'></span>
                          </span>
                        ) : null}
                        <Avatar>
                          <AvatarFallback>
                            <MailPlus className='text-muted-foreground w-5 h-5' />
                          </AvatarFallback>
                        </Avatar>
                      </PopoverTrigger>
                      <PopoverContent
                        align='end'
                        className='max-h-64 w-[400px] flex flex-col h-full'>
                        <div className='flex-grow overflow-y-auto flex flex-col gap-2'>
                          {adviserRequests && adviserRequests.length > 0 ? (
                            <>
                              {adviserRequests.map(
                                ({ id, user, createdAt, status }) => (
                                  <div
                                    key={id}
                                    className='border rounded-sm p-2'>
                                    <div className='flex items-center gap-2 justify-between'>
                                      <div className='grid gap-1'>
                                        <p className='text-sm'>
                                          <span className='font-medium'>
                                            {user.firstName} {user.lastName}
                                          </span>{' '}
                                          {status === 'APPROVED'
                                            ? 'request has been accept'
                                            : status === 'REJECTED'
                                            ? 'request has been rejected'
                                            : 'has requested to join your group'}
                                        </p>
                                        <p className='text-xs text-muted-foreground'>
                                          {format(new Date(createdAt), 'PPp')}
                                        </p>
                                      </div>
                                      {status === 'PENDING' ? (
                                        <div className='flex items-center gap-1'>
                                          <Button
                                            variant='outline'
                                            disabled={
                                              acceptLoading || rejectLoading
                                            }
                                            onClick={() =>
                                              acceptRequest({
                                                groupId,
                                                requestId: id,
                                                userRequestId: user.id,
                                              })
                                            }
                                            className='rounded-full hover:bg-green-300 group h-8 w-8 p-0'>
                                            {acceptLoading ? (
                                              <Loader2 className='h-4 w-4 animate-spin' />
                                            ) : (
                                              <Check className='h-4 w-4 group-hover:text-green-800' />
                                            )}
                                          </Button>
                                          <Button
                                            variant='outline'
                                            disabled={
                                              acceptLoading || rejectLoading
                                            }
                                            onClick={() =>
                                              rejectRequest({
                                                requestId: id,
                                              })
                                            }
                                            className='rounded-full hover:bg-red-300 group h-8 w-8 p-0'>
                                            {rejectLoading ? (
                                              <Loader2 className='h-4 w-4 animate-spin' />
                                            ) : (
                                              <X className='h-4 w-4 group-hover:text-red-800' />
                                            )}
                                          </Button>
                                        </div>
                                      ) : (
                                        <Button
                                          variant='outline'
                                          disabled={deleteLoading}
                                          onClick={() =>
                                            deleteRequest({ requestId: id })
                                          }
                                          className='rounded-full h-8 w-8 p-0 hover:bg-red-300 group'>
                                          {deleteLoading ? (
                                            <Loader2 className='h-4 w-4 animate-spin' />
                                          ) : (
                                            <Trash2 className='h-4 w-4 group-hover:text-red-800' />
                                          )}
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ),
                              )}
                            </>
                          ) : requestsLoading ? (
                            <div className='flex justify-center py-4'>
                              <Loader2 className='animate-spin' />
                            </div>
                          ) : (
                            <div className='flex flex-col items-center'>
                              <Ghost className='h-6 w-6 text-gray-500' />
                              <p className='text-gray-500 text-sm font-medium'>
                                No Join Requests
                              </p>
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <AdviserInviteButton />
                  </div>
                </div>
              </CardHeader>
              {adviser?.id && adviser ? (
                <CardContent className='flex flex-col flex-grow h-0 overflow-y-auto'>
                  <div className='p-4 border rounded-lg h-full'>
                    <div className='items-center flex gap-4'>
                      <Avatar>
                        <AvatarImage
                          src={adviser.picture as string | undefined}
                        />
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
              ) : (
                <div className='flex flex-col items-center'>
                  <Ghost className='h-8 w-8 text-gray-500' />
                  <p className='text-gray-500 text-sm font-medium'>
                    No Adviser
                  </p>
                </div>
              )}
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
