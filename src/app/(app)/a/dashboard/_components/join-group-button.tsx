'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { trpc } from '@/app/_trpc/client';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import SelectGroup from '@/components/select-group';

export default function JoinGroupButton() {
  const { data: groups, isLoading } = trpc.group.getAll.useQuery();

  const { toast } = useToast();

  const { mutate: requestToJoinGroup, isLoading: requestLoading } =
    trpc.joinRequest.requestToJoinGroup.useMutation({
      onSuccess: () => {
        toast({
          title: 'Request Sent',
          description: 'Your request to join the group has been sent',
        });
      },
    });

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const submit = () => {
    requestToJoinGroup({ groupId: value });
  };

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
          <SelectGroup
            open={open}
            setOpen={setOpen}
            value={value}
            setValue={setValue}
            isLoading={isLoading}
            groups={groups?.map((group) => ({
              ...group,
              createdAt: new Date(group.createdAt),
              updatedAt: new Date(group.updatedAt),
              members: group.members.map((member) => ({
                ...member,
                createdAt: new Date(member.createdAt),
                updatedAt: new Date(member.updatedAt),
              })),
            }))}
          />
          <Button
            disabled={!value || requestLoading}
            className='self-end'
            onClick={submit}>
            {requestLoading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              'Request to Join'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
