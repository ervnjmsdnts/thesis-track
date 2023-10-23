'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '../_trpc/client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@prisma/client';
import { useRouter } from 'next/navigation';

const schema = z.object({
  title: z.string().nullable(),
});

type Schema = z.infer<typeof schema>;

export default function AssignGroup() {
  const { data: users } = trpc.user.getWithNoGroup.useQuery();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const form = useForm<Schema>({ resolver: zodResolver(schema) });

  const router = useRouter();

  const { mutate: createGroupByStudent } =
    trpc.group.createGroupByStudent.useMutation({
      onSuccess: () => router.replace('/dashboard'),
    });

  const submit = async (data: Schema) => {
    createGroupByStudent({ title: data.title, members: selectedUsers });
  };

  return (
    <div className='flex justify-center items-center h-full w-full'>
      <Card className='w-[600px]'>
        <CardHeader>
          <CardTitle>Create group</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-2'>
            <div>
              <Label>Thesis Title</Label>
              <div>
                <Input
                  placeholder='Name of your thesis'
                  {...form.register('title')}
                />
                <span className='text-muted-foreground text-xs pl-1'>
                  Leave blank if no title yet
                </span>
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-8 border-dashed'>
                  <PlusCircle className='mr-2 h-4 w-4' />
                  Select Members
                  {selectedUsers?.length > 0 && (
                    <>
                      <Separator orientation='vertical' className='mx-2 h-4' />
                      <Badge
                        variant='secondary'
                        className='rounded-sm px-1 font-normal lg:hidden'>
                        {selectedUsers.length}
                      </Badge>
                      <div className='hidden space-x-1 lg:flex'>
                        {selectedUsers.length > 2 ? (
                          <Badge
                            variant='secondary'
                            className='rounded-sm px-1 font-normal'>
                            {selectedUsers.length} selected
                          </Badge>
                        ) : (
                          users
                            ?.filter((user) =>
                              selectedUsers.find(
                                (su) => su.email === user.email,
                              ),
                            )
                            .map((option) => (
                              <Badge
                                variant='secondary'
                                key={option.email}
                                className='rounded-sm px-1 font-normal'>
                                {option.firstName} {option.lastName}
                              </Badge>
                            ))
                        )}
                      </div>
                    </>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-full p-0'>
                <Command>
                  <CommandInput placeholder='Select Members' />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                      {users &&
                        users.map((user) => {
                          const isSelected = selectedUsers.some(
                            (su) => su.email === user.email,
                          );
                          return (
                            <CommandItem
                              key={user.email}
                              value={user.email}
                              onSelect={() => {
                                if (isSelected) {
                                  setSelectedUsers((prev) =>
                                    prev.filter((p) => p.email !== user.email),
                                  );
                                } else {
                                  setSelectedUsers((prev) => [
                                    ...prev,
                                    {
                                      ...user,
                                      createdAt: new Date(user.createdAt),
                                      updatedAt: new Date(user.updatedAt),
                                    },
                                  ]);
                                }
                              }}>
                              <div
                                className={cn(
                                  'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                  isSelected
                                    ? 'bg-primary text-primary-foreground'
                                    : 'opacity-50 [&_svg]:invisible',
                                )}>
                                <Check className={cn('h-4 w-4')} />
                              </div>
                              <span>
                                {user.firstName} {user.lastName}
                              </span>
                            </CommandItem>
                          );
                        })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
        <CardFooter className='flex justify-end'>
          <Button onClick={form.handleSubmit(submit)}>Create</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
