'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { trpc } from '@/app/_trpc/client';
import { Check, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

export default function JoinGroupButton() {
  const { data: groups, isLoading } = trpc.group.getAll.useQuery();

  const [searchGroup, setSearchGroup] = useState('');
  const [searchStudent, setSearchStudent] = useState('');

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const filteredGroups = useMemo(() => {
    if (!groups) {
      return [];
    }

    let filteredData = groups;

    if (searchGroup) {
      filteredData = groups.filter((group) =>
        group.title?.toLowerCase().includes(searchGroup.toLowerCase()),
      );

      if (searchStudent) {
        filteredData = filteredData.filter((group) =>
          group.members.some((member) => {
            const name = `${member.firstName} ${member.lastName}`;

            return name.toLowerCase().includes(searchStudent.toLowerCase());
          }),
        );
      }
    }

    if (searchStudent && !searchGroup) {
      filteredData = groups.filter((group) =>
        group.members.some((member) => {
          const name = `${member.firstName} ${member.lastName}`;

          return name.toLowerCase().includes(searchStudent.toLowerCase());
        }),
      );
    }

    return filteredData;
  }, [searchGroup, searchStudent, groups]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>Join Group</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Group</DialogTitle>
        </DialogHeader>
        <div className='flex w-full flex-col gap-4'>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                className='justify-between'
                role='combobox'
                variant='outline'>
                <p
                  className={cn(
                    'text-muted-foreground',
                    value && 'text-foreground',
                  )}>
                  {value
                    ? filteredGroups?.find((group) => group.id === value)?.title
                    : 'Select group...'}
                </p>
                <svg
                  className=' ml-2 h-4 w-4 shrink-0 opacity-50'
                  fill='none'
                  height='24'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  viewBox='0 0 24 24'
                  width='24'
                  xmlns='http://www.w3.org/2000/svg'>
                  <path d='m7 15 5 5 5-5' />
                  <path d='m7 9 5-5 5 5' />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent className='p-0 w-[400px]'>
              <Command shouldFilter={false} className='w-full'>
                <CommandInput
                  className='h-9'
                  placeholder='Search group...'
                  value={searchGroup}
                  onValueChange={(search) => setSearchGroup(search)}
                />
                <CommandInput
                  className='h-9'
                  placeholder='Search student...'
                  value={searchStudent}
                  onValueChange={(search) => setSearchStudent(search)}
                />
                <CommandGroup>
                  {filteredGroups && filteredGroups.length > 0 ? (
                    <>
                      {filteredGroups.map((group) => (
                        <HoverCard key={group.id}>
                          <HoverCardTrigger asChild>
                            <CommandItem
                              value={group.id}
                              onSelect={(currValue) => {
                                setValue(currValue === value ? '' : currValue);
                                setOpen(false);
                              }}>
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  value === group.id
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                              {group.title}
                            </CommandItem>
                          </HoverCardTrigger>
                          <HoverCardContent side='right' className='p-2 w-full'>
                            <div className='flex flex-col gap-3'>
                              {group.members.map((member) => (
                                <div
                                  key={member.id}
                                  className='flex gap-2 items-center'>
                                  <Avatar>
                                    {/* <AvatarImage
                                      alt='Member 1'
                                      src='/placeholder-avatar.jpg'
                                    /> */}
                                    <AvatarFallback>
                                      {member.firstName[0]}
                                      {member.lastName[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <p className='text-sm'>
                                    {member.firstName} {member.lastName}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      ))}
                    </>
                  ) : isLoading ? (
                    <div className='flex justify-center py-4 w-full'>
                      <Loader2 className='w-6 h-6 animate-spin' />
                    </div>
                  ) : (
                    <p className='text-sm text-center py-4'>No group found</p>
                  )}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <Button className='self-end'>Request to join</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
