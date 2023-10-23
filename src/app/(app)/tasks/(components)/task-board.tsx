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
} from '@/components/ui/sheet';
import { toTitleCase } from '@/lib/utils';
import { Group, Task, TaskStatus, User } from '@prisma/client';
import { Clock, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DragDropContext, Draggable, DropResult } from 'react-beautiful-dnd';
import { default as Droppable } from '@/components/strict-mode-droppable';
import { trpc } from '@/app/_trpc/client';
import { pusherClient } from '@/lib/pusher';

function CreateTaskSheet({
  open,
  setOpen,
  taskStatus,
}: {
  open: boolean;
  setOpen: any;
  taskStatus: TaskStatus | null;
}) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{toTitleCase(taskStatus)} Task</SheetTitle>
        </SheetHeader>
      </SheetContent>
    </Sheet>
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
    <>
      <CreateTaskSheet
        open={open}
        setOpen={setOpen}
        taskStatus={selectedTaskStatus!}
      />
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
                    <Button
                      onClick={() => {
                        setSelectedTaskStatus(status);
                        setOpen(true);
                      }}
                      variant='outline'
                      size='sm'>
                      <Plus className='h-4 w-4' />
                    </Button>
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
    </>
  );
}
