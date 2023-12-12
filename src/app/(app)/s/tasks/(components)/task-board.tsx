'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Group, Task, TaskStatus, TaskTypes, User } from '@prisma/client';
import {
  Calendar as CalendarIcon,
  Clock,
  Delete,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
} from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import PriorityBadge from '@/components/priority-badge';
import TypeBadge from '@/components/type-badge';

const schema = z.object({
  title: z.string(),
  status: z.enum(['PENDING', 'ONGOING', 'COMPLETE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  type: z.enum(['DOCUMENTATION', 'DEVELOPMENT', 'DESIGN', 'OTHER']),
  assigneeId: z.string(),
  dueDate: z.date(),
});

type Schema = z.infer<typeof schema>;

function ActionTask({
  taskStatus,
  group,
  closeSheet,
  task,
}: {
  taskStatus?: TaskStatus;
  task?: Task;
  group: Group & { members: User[] };
  isEdit?: boolean;
  closeSheet: () => void;
}) {
  const isEdit = task?.id !== undefined && Object.keys(task).length > 0;

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    ...(isEdit
      ? {
          defaultValues: {
            type: task?.type,
            assigneeId: task?.assigneeId,
            dueDate: task?.dueDate,
            priority: task?.priority,
            status: task?.status,
            title: task?.title,
          },
        }
      : {}),
  });

  const { mutate: createTask, isLoading: createLoading } =
    trpc.task.createTask.useMutation({
      onSuccess: () => closeSheet(),
    });
  const { mutate: updateTask, isLoading: updateLoading } =
    trpc.task.updateTask.useMutation({
      onSuccess: () => closeSheet(),
    });

  const isLoading = createLoading || updateLoading;

  const submit = (data: Schema) => {
    if (isEdit) {
      updateTask({
        ...data,
        dueDate: data.dueDate.toString(),
        taskId: task.id,
        groupId: group.id,
      });
    } else {
      createTask({
        ...data,
        groupId: group.id,
        dueDate: data.dueDate.toString(),
      });
    }
  };

  return (
    <>
      <div className='flex flex-col gap-2 flex-grow'>
        <Input placeholder='Title' {...form.register('title')} />
        {!isEdit ? (
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
        ) : null}
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
                  <SelectLabel>Priorities</SelectLabel>
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
                  <SelectLabel>Types</SelectLabel>
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
          name='assigneeId'
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger
                className={cn(!field.value && 'text-muted-foreground')}>
                <SelectValue placeholder='Assign to' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Members</SelectLabel>
                  {group?.members
                    .filter((m) => m.role === 'STUDENT')
                    .map((member) => (
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
                    format(new Date(field.value), 'PPP')
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
                    return date < new Date();
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
      <Button onClick={form.handleSubmit(submit)} disabled={isLoading}>
        {isLoading ? (
          <Loader2 className='h-4 w-4 animate-spin' />
        ) : isEdit ? (
          'Update Task'
        ) : (
          'Add Task'
        )}
      </Button>
    </>
  );
}

function Task({
  task,
  group,
}: {
  task: Task;
  group: Group & { members: User[] };
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const assignee = group.members.find(
    (member) => member.id === task.assigneeId,
  );

  const { mutate: deleteTask } = trpc.task.deleteTask.useMutation({
    onSuccess: () => setDialogOpen(false),
  });

  const handleDelete = () => {
    deleteTask({ taskId: task.id, groupId: group.id });
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-xl mb-2'>{task.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='p-2'>
                <MoreHorizontal className='w-5 h-5' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild onSelect={(e) => e.preventDefault()}>
                    <DropdownMenuItem>
                      <Pencil className='mr-2 h-4 w-4' />
                      <span>Edit</span>
                    </DropdownMenuItem>
                  </SheetTrigger>
                  <SheetContent className='flex flex-col'>
                    <SheetHeader>
                      <SheetTitle>{toTitleCase(task.status)}</SheetTitle>
                    </SheetHeader>
                    <ActionTask
                      taskStatus={task.status}
                      closeSheet={() => setSheetOpen(false)}
                      group={group}
                      task={task}
                    />
                  </SheetContent>
                </Sheet>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild onSelect={(e) => e.preventDefault()}>
                    <DropdownMenuItem>
                      <Delete className='mr-2 h-4 w-4' />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Are you sure you want to delete this task?
                      </DialogTitle>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant='ghost'>Cancel</Button>
                      <Button variant='destructive' onClick={handleDelete}>
                        Confirm
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className='flex gap-2'>
          <PriorityBadge priority={task.priority} />
          <TypeBadge type={task.type} />
        </div>
      </CardHeader>
      <Separator className='mb-4' />
      <CardFooter className='flex justify-between items-center'>
        <div className='flex text-zinc-500 text-sm items-center gap-2'>
          <Clock className='h-4 w-4' />
          <p>{format(new Date(task?.dueDate), 'PP')}</p>
        </div>
        <Avatar>
          <AvatarImage src={assignee?.picture as string | undefined} />
          <AvatarFallback>
            {assignee?.firstName[0]}
            {assignee?.lastName[0]}
          </AvatarFallback>
        </Avatar>
      </CardFooter>
    </Card>
  );
}

export default function TaskBoard({
  group,
}: {
  group: Group & {
    members: User[];
    tasks: Task[];
  };
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

  const { mutate: updateTaskStatus } = trpc.task.updateStatus.useMutation();

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
            .map((item) => ({
              ...item,
              dueDate: new Date(item.dueDate),
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt),
            }))
            .sort((a, b) => a.position - b.position),
        },
        ONGOING: {
          name: 'Ongoing',
          items: data
            .filter((t) => t.status === 'ONGOING')
            .map((item) => ({
              ...item,
              dueDate: new Date(item.dueDate),
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt),
            }))
            .sort((a, b) => a.position - b.position),
        },
        COMPLETE: {
          name: 'Complete',
          items: data
            .filter((t) => t.status === 'COMPLETE')
            .map((item) => ({
              ...item,
              dueDate: new Date(item.dueDate),
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt),
            }))
            .sort((a, b) => a.position - b.position),
        },
      };

      setColumns((prev) => ({ ...prev, ...updatedTasks }));
    });
    pusherClient.bind('new-task', (data: Task) => {
      const updatedColumns = { ...columns };

      updatedColumns[data.status] = {
        name: data.status,
        items: [
          ...updatedColumns[data.status].items,
          {
            ...data,
            dueDate: new Date(new Date(data.dueDate)),
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
          },
        ],
      };

      updatedColumns[data.status].items.sort((a, b) => a.position - b.position);

      setColumns(updatedColumns);
    });
    pusherClient.bind('update-task', (updatedTask: Task) => {
      const updatedColumns = { ...columns };

      const statusColumn = updatedColumns[updatedTask.status];
      const updatedItems = statusColumn.items.map((item) =>
        item.id === updatedTask.id ? updatedTask : item,
      );

      updatedItems.sort((a, b) => a.position - b.position);

      updatedColumns[updatedTask.status] = {
        ...statusColumn,
        items: [
          ...updatedItems.map((item) => ({
            ...item,
            dueDate: new Date(item.dueDate),
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
          })),
        ],
      };

      setColumns(updatedColumns);
    });
    pusherClient.bind('delete-task', (deletedTaskId: string) => {
      setColumns((prevColumns) => {
        const updatedColumns = { ...prevColumns };

        const columnNames = Object.keys(updatedColumns) as TaskStatus[];

        columnNames.forEach((status) => {
          updatedColumns[status].items = updatedColumns[status].items.filter(
            (item) => item.id !== deletedTaskId,
          );
        });

        return updatedColumns;
      });
    });

    return () => {
      pusherClient.unsubscribe(group.id);
      pusherClient.unbind(group.id);
    };
  }, [group.id, columns]);

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
                  <Sheet open={open} onOpenChange={setOpen}>
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
                      <ActionTask
                        closeSheet={() => setOpen(false)}
                        taskStatus={selectedTaskStatus!}
                        group={group}
                      />
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
                              <Task task={task} group={group} />
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
