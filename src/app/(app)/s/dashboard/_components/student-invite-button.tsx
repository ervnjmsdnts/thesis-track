'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { trpc } from '@/app/_trpc/client';
import { User } from '@prisma/client';
import SelectMultipleMembers from '@/components/select-multiple-members';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function StudentInviteButton() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<User[]>([]);

  const { toast } = useToast();

  const { mutate: sendStudentInvites, isLoading } =
    trpc.group.sendStudentInvites.useMutation({
      onSuccess: (studentNames) => {
        if (studentNames.length > 2) {
          toast({
            title: 'Invites Sent',
            description: `Emails have been sent to ${studentNames.length} students.`,
          });
        } else if (studentNames.length === 2) {
          toast({
            title: 'Invites Sent',
            description: `Emails have been sent to ${studentNames[0]} and ${studentNames[1]}.`,
          });
        } else if (studentNames.length === 1) {
          toast({
            title: 'Invite Sent',
            description: `An email has been sent to ${studentNames[0]}`,
          });
        }
        setDialogOpen(false);
      },
    });

  const submit = () => {
    sendStudentInvites({ students: selectedStudents });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>Invite</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Students</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4 w-full'>
          <SelectMultipleMembers
            selectedUsers={selectedStudents}
            setSelectedUsers={setSelectedStudents}
          />
          <Button
            className='self-end'
            disabled={selectedStudents.length === 0 || isLoading}
            onClick={submit}>
            {isLoading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              'Send Invites'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
