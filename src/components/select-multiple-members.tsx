'use client';

import { Check, Loader2, PlusCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import { cn } from '@/lib/utils';
import { trpc } from '@/app/_trpc/client';
import { User } from '@prisma/client';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';

export default function SelectMultipleMembers({
  selectedUsers,
  setSelectedUsers,
}: {
  selectedUsers: User[];
  setSelectedUsers: Dispatch<SetStateAction<User[]>>;
}) {
  const { data: students, isLoading } =
    trpc.user.getStudentsWithNoGroup.useQuery();
  const [open, setOpen] = useState(false);
  const [searchStudent, setSearchStudent] = useState('');

  const filteredStudents = useMemo(() => {
    if (!students) return [];

    return !searchStudent
      ? students
      : students.filter((student) => {
          const name = `${student.firstName} ${student.lastName}`;

          return name.toLowerCase().includes(searchStudent.toLowerCase());
        });
  }, [students, searchStudent]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='h-8 border-dashed'>
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
                  filteredStudents
                    ?.filter((user) =>
                      selectedUsers.find((su) => su.email === user.email),
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
      <PopoverContent className='w-[400px] p-0'>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder='Select Members'
            value={searchStudent}
            onValueChange={(search) => setSearchStudent(search)}
          />
          <CommandList>
            <CommandGroup>
              {filteredStudents && filteredStudents.length > 0 ? (
                filteredStudents.map((user) => {
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
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          isSelected ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <p>
                        <span className='font-medium'>
                          {user.firstName} {user.lastName}
                        </span>{' '}
                        <span>{`<${user.email}>`}</span>
                      </p>
                    </CommandItem>
                  );
                })
              ) : isLoading ? (
                <div className='flex justify-center py-4 w-full'>
                  <Loader2 className='w-6 h-6 animate-spin' />
                </div>
              ) : (
                <p className='text-center text-sm py-4'>No student found</p>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
