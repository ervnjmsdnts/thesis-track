'use client';

import { trpc } from '@/app/_trpc/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { UserX } from 'lucide-react';
import { useState } from 'react';

export default function DeleteUserDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);

  const util = trpc.useUtils();

  const { mutate: deleteUser, isLoading } = trpc.user.deleteUser.useMutation({
    onSuccess: () => {
      util.user.getAll.invalidate();
      setOpen(false);
    },
  });

  const submit = () => {
    deleteUser({ userId });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className='flex flex-row gap-2 items-center text-sm'>
          <UserX className='w-4 h-4 text-muted-foreground' />
          Delete User
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Group</DialogTitle>
        </DialogHeader>
        <h2>Are you sure you want to delete this user?</h2>
        <DialogFooter>
          <Button
            onClick={() => setOpen(false)}
            variant='secondary'
            disabled={isLoading}>
            Cancel
          </Button>
          <Button variant='outline' onClick={submit} disabled={isLoading}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
