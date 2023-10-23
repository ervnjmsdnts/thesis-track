'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn, toTitleCase } from '@/lib/utils';
import { Group, Task, TaskStatus, User } from '@prisma/client';
import { Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DragDropContext, Draggable, DropResult } from 'react-beautiful-dnd';
import { default as Droppable } from '@/components/strict-mode-droppable';
import { trpc } from '@/app/_trpc/client';
import { pusherClient } from '@/lib/pusher';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';

const schema = z.object({
  title: z.string(),
  status: z.enum(['PENDING', 'ONGOING', 'COMPLETE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  type: z.enum(['DOCUMENTATION', 'DEVELOPMENT', 'DESIGN']),
  assignTo: z.string(),
  dueDate: z.date(),
});

type Schema = z.infer<typeof schema>;

function CreateTask({ taskStatus }: { taskStatus: TaskStatus }) {
  const form = useForm<Schema>({ resolver: zodResolver(schema) });

  const { data: currentGroup } = trpc.getCurrentUserGroup.useQuery();

  const submit = (data: Schema) => {
    console.log({ data });
  };

  return (
    <>
      <div className='flex flex-col gap-2 flex-grow'>
        <Input placeholder='Title' {...form.register('title')} />
        <Controller
          control={form.control}
          defaultValue={taskStatus}
          name='status'
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger
                className={cn(!field.value && 'text-muted-foreground')}>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Statuses</SelectLabel>
                  <SelectItem value='PENDING'>Pending</SelectItem>
                  <SelectItem value='ONGOING'>Ongoing</SelectItem>
                  <SelectItem value='COMPLETE'>Complete</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        <Controller
          control={form.control}
          name='priority'
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger
                className={cn(!field.value && 'text-muted-foreground')}>
                <SelectValue placeholder='Select priority' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Statuses</SelectLabel>
                  <SelectItem value='LOW'>Low</SelectItem>
                  <SelectItem value='MEDIUM'>Medium</SelectItem>
                  <SelectItem value='HIGH'>High</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        <Controller
          control={form.control}
          name='type'
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger
                className={cn(!field.value && 'text-muted-foreground')}>
                <SelectValue placeholder='Select type' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Statuses</SelectLabel>
                  <SelectItem value='DOCUMENTATION'>Documentation</SelectItem>
                  <SelectItem value='DEVELOPMENT'>Development</SelectItem>
                  <SelectItem value='DESIGN'>Design</SelectItem>
                  <SelectItem value='OTHER'>Other</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        <Controller
          control={form.control}
          name='assignTo'
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger
                className={cn(!field.value && 'text-muted-foreground')}>
                <SelectValue placeholder='Assign to' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Members</SelectLabel>
                  {currentGroup?.members.map((member) => (
                    <SelectItem value={member.id} key={member.id}>
                      {member.firstName} {member.lastName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        <Controller
          control={form.control}
          name='dueDate'
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'pl-3 text-left font-normal',
                    !field.value && 'text-muted-foreground',
                  )}>
                  {field.value ? (
                    format(field.value, 'PPP')
                  ) : (
                    <span>Pick due date</span>
                  )}
                  <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  mode='single'
                  disabled={(date) => {
                    const currentDate = new Date();
                    currentDate.setHours(0, 0, 0, 0);
                    return date < currentDate;
                  }}
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        />
      </div>
      <Button onClick={form.handleSubmit(submit)}>Add Task</Button>
    </>
  );
}

function Task({ title = 'Create Introduction' }: { title?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-xl mb-2'>{title}</CardTitle>
        <div className='flex gap-2'>
          <Badge>Medium</Badge>
          <Badge>Development</Badge>
        </div>
      </CardHeader>
      <Separator className='mb-4' />
      <CardFooter className='flex justify-between items-center'>
        <div className='flex text-zinc-500 text-sm items-center gap-2'>
          <Clock className='h-4 w-4' />
          <p>Due date</p>
        </div>
        <Avatar>
          <AvatarFallback>TT</AvatarFallback>
        </Avatar>
      </CardFooter>
    </Card>
  );
}

export default function TaskBoard({
  group,
}: {
  group: Group & { members: User[]; tasks: Task[] };
}) {
  const [open, setOpen] = useState(false);
  const [selectedTaskStatus, setSelectedTaskStatus] =
    useState<TaskStatus | null>(null);

  type Column = {
    name: string;
    items: Task[];
  };

  const initialColumns: Record<TaskStatus, Column> = {
    PENDING: {
      name: 'Pending',
      items: group.tasks
        .filter((t) => t.status === 'PENDING')
        .sort((a, b) => a.position - b.position),
    },
    ONGOING: {
      name: 'Ongoing',
      items: group.tasks
        .filter((t) => t.status === 'ONGOING')
        .sort((a, b) => a.position - b.position),
    },
    COMPLETE: {
      name: 'Complete',
      items: group.tasks
        .filter((t) => t.status === 'COMPLETE')
        .sort((a, b) => a.position - b.position),
    },
  };

  const [columns, setColumns] = useState(initialColumns);

  const { mutate: updateTaskStatus } = trpc.updateTaskStatus.useMutation();

  const handleOnDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    const sourceId = source.droppableId as TaskStatus;
    const destId = destination.droppableId as TaskStatus;

    const newColumns = { ...columns };

    const sourceColumn = newColumns[sourceId];
    const destColumn = newColumns[destId];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];
    const [movedTask] = sourceItems.splice(source.index, 1);

    if (sourceId === destId) {
      const column = newColumns[sourceId];
      const newItems = [...column.items];
      const [movedTask] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, movedTask);

      newColumns[sourceId] = {
        ...column,
        items: newItems,
      };
    } else {
      movedTask.status = destId;
      destItems.splice(destination.index, 0, movedTask);

      newColumns[sourceId] = {
        ...sourceColumn,
        items: sourceItems,
      };

      newColumns[destId] = {
        ...destColumn,
        items: destItems,
      };
    }
    const allTasks = Object.values(newColumns).flatMap(
      (column) => column.items,
    );
    allTasks.forEach((task, index) => {
      task.position = index;
    });

    updateTaskStatus({
      status: destId,
      tasks: allTasks,
      taskId: movedTask.id,
      groupId: group.id,
    });

    setColumns(newColumns);
  };

  useEffect(() => {
    pusherClient.subscribe(group.id);

    pusherClient.bind('new-column', (data: Task[]) => {
      const updatedTasks: Record<TaskStatus, Column> = {
        PENDING: {
          name: 'Pending',
          items: data
            .filter((t) => t.status === 'PENDING')
            .sort((a, b) => a.position - b.position),
        },
        ONGOING: {
          name: 'Ongoing',
          items: data
            .filter((t) => t.status === 'ONGOING')
            .sort((a, b) => a.position - b.position),
        },
        COMPLETE: {
          name: 'Complete',
          items: data
            .filter((t) => t.status === 'COMPLETE')
            .sort((a, b) => a.position - b.position),
        },
      };

      setColumns((prev) => ({ ...prev, ...updatedTasks }));
    });

    return () => {
      pusherClient.unsubscribe(group.id);
    };
  }, [group.id]);

  return (
    <div className='flex-grow'>
      <div className='grid grid-cols-3 h-full gap-6'>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          {Object.keys(columns).map((columnId) => {
            const status = columnId as TaskStatus;
            return (
              <div key={columnId} className='flex flex-col h-full gap-4'>
                <div className='flex items-center justify-between w-full'>
                  <h3 className='font-semibold text-xl'>
                    {columns[status].name} Tasks
                  </h3>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        onClick={() => {
                          setSelectedTaskStatus(status);
                        }}
                        variant='outline'
                        size='sm'>
                        <Plus className='h-4 w-4' />
                      </Button>
                    </SheetTrigger>
                    <SheetContent className='flex flex-col'>
                      <SheetHeader>
                        <SheetTitle>
                          {toTitleCase(selectedTaskStatus!)}
                        </SheetTitle>
                      </SheetHeader>
                      <CreateTask taskStatus={selectedTaskStatus!} />
                    </SheetContent>
                  </Sheet>
                </div>
                <Droppable droppableId={columnId}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className='flex flex-col bg-zinc-50 rounded-lg p-4 flex-grow h-0 overflow-y-auto gap-2'>
                      {columns[status].items.map((task, taskIndex) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id.toString()}
                          index={taskIndex}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}>
                              <Task title={task.title} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </DragDropContext>
      </div>
    </div>
  );
}
