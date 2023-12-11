'use client';

import { trpc } from '@/app/_trpc/client';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
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
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Check, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function AdviserInviteButton() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [popOpen, setPopOpen] = useState(false);
  const [value, setValue] = useState('');
  const [searchAdviser, setSearchAdviser] = useState('');

  const { toast } = useToast();

  const { data: users, isLoading: usersLoading } = trpc.user.getAll.useQuery();
  const { mutate: sendAdviserInvite, isLoading: inviteLoading } =
    trpc.group.sendAdviserInvite.useMutation({
      onSuccess: (name) => {
        toast({
          title: 'Invite Sent',
          description: `An email has been sent to ${name}`,
        });
        setDialogOpen(false);
      },
    });

  const advisers = users?.filter((user) => user.role === 'ADVISER');

  const filteredAdviser = useMemo(() => {
    if (!advisers) return [];

    return !searchAdviser
      ? advisers
      : advisers.filter((adviser) => {
          const name = `${adviser.firstName} ${adviser.lastName}`;

          return name.toLowerCase().includes(searchAdviser.toLowerCase());
        });
  }, [advisers, searchAdviser]);

  const selectedAdviser = filteredAdviser?.find(
    (adviser) => adviser.id === value,
  );

  const submit = () => {
    sendAdviserInvite({ adviserId: value });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>Invite</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Adviser</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4 w-full'>
          <Popover open={popOpen} onOpenChange={setPopOpen}>
            <PopoverTrigger asChild>
              <Button
                className='w-full text-muted-foreground justify-between'
                role='combobox'
                variant='outline'>
                <p
                  className={cn(
                    'text-muted-foreground',
                    value && 'text-foreground',
                  )}>
                  {value && selectedAdviser
                    ? `${selectedAdviser.firstName} ${selectedAdviser.lastName}`
                    : 'Select adviser...'}
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
            <PopoverContent className='w-[400px] p-0'>
              <Command shouldFilter={false}>
                <CommandInput
                  className='h-9'
                  placeholder='Search adviser...'
                  value={searchAdviser}
                  onValueChange={(search) => setSearchAdviser(search)}
                />
                <CommandGroup>
                  {filteredAdviser && filteredAdviser.length > 0 ? (
                    <>
                      {filteredAdviser.map((adviser) => (
                        <div key={adviser.id}>
                          <CommandItem
                            value={adviser.id}
                            onSelect={(currValue) => {
                              setValue(currValue === value ? '' : currValue);
                              setPopOpen(false);
                            }}>
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                value === adviser.id
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                            <p>
                              <span className='font-medium'>
                                {adviser.firstName} {adviser.lastName}
                              </span>{' '}
                              <span>{`<${adviser.email}>`}</span>
                            </p>
                          </CommandItem>
                        </div>
                      ))}
                    </>
                  ) : usersLoading ? (
                    <div className='flex justify-center py-4 w-full'>
                      <Loader2 className='w-6 h-6 animate-spin' />
                    </div>
                  ) : (
                    <p className='text-center text-sm py-4'>No adviser found</p>
                  )}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <Button
            className='self-end'
            disabled={!value || inviteLoading}
            onClick={submit}>
            {inviteLoading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              'Send Invite'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
