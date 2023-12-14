import { trpc } from '@/app/_trpc/client';
import SelectGroup from '@/components/select-group';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function JoinGroup({
  createGroup,
}: {
  createGroup: () => void;
}) {
  const { data: groups, isLoading } = trpc.group.getAll.useQuery();

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

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

  const submit = () => {
    requestToJoinGroup({ groupId: value });
  };

  return (
    <div className='flex justify-center items-center w-full h-full'>
      <Card className='w-[600px]'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Join Group</CardTitle>
            <Button variant='link' onClick={createGroup}>
              Create a group
            </Button>
          </div>
        </CardHeader>
        <CardContent className='w-full'>
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
        </CardContent>
        <CardFooter className='flex justify-end'>
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
        </CardFooter>
      </Card>
    </div>
  );
}
