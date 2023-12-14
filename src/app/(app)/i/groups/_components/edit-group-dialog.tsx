'use client';

import { trpc } from '@/app/_trpc/client';
import SelectMultipleMembers from '@/components/select-multiple-members';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@prisma/client';
import { Loader2, Users } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1),
  adviserId: z.string().optional(),
});

type Schema = z.infer<typeof schema>;

export default function EditGroupDialog({
  groupId,
  title,
  existingMembers,
  adviserId,
}: {
  groupId: string;
  title: string;
  existingMembers: User[];
  adviserId?: string;
}) {
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { title, adviserId },
  });

  const util = trpc.useUtils();

  const [open, setOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const { data: users, isLoading: userLoading } = trpc.user.getAll.useQuery();

  const advisers = users?.filter((user) => user.role === 'ADVISER');

  const { mutate: updateGroup, isLoading: updateLoading } =
    trpc.group.updateGroup.useMutation({
      onSuccess: () => {
        util.group.getAll.invalidate();
        setOpen(false);
      },
    });

  const submit = (data: Schema) => {
    updateGroup({
      groupId,
      members: selectedUsers,
      adviserId: data.adviserId,
      title: data.title,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className='flex flex-row gap-2 items-center text-sm'>
          <Users className='w-4 h-4 text-muted-foreground' />
          Update Group
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Group</DialogTitle>
        </DialogHeader>
        <div className='flex justify-center items-center h-full w-full'>
          <div className='w-full'>
            <div className='grid gap-2'>
              <div>
                <Label>Thesis Title</Label>
                <div>
                  <Input
                    placeholder='Name of your thesis'
                    className={cn(
                      form.formState.errors.title &&
                        'focus-visible:ring-red-400 border-red-400',
                    )}
                    {...form.register('title')}
                  />
                </div>
              </div>
              <div>
                <Label>Adviser</Label>
                <Controller
                  control={form.control}
                  name='adviserId'
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <SelectTrigger
                        disabled={userLoading}
                        className={cn(
                          field.value ? 'text-black' : 'text-muted-foreground',
                        )}>
                        <SelectValue placeholder='Select adviser' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Advisers</SelectLabel>
                          {advisers && advisers.length > 0 ? (
                            <>
                              {advisers.map((adviser) => (
                                <SelectItem key={adviser.id} value={adviser.id}>
                                  {adviser.firstName} {adviser.lastName}
                                </SelectItem>
                              ))}
                            </>
                          ) : (
                            <div className='flex items-center py-4 justify-center'>
                              <p className='text-sm text-muted-foreground'>
                                No advisers
                              </p>
                            </div>
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <SelectMultipleMembers
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
                currentMembers={existingMembers}
              />
              <div className='flex justify-end mt-4'>
                <Button
                  onClick={form.handleSubmit(submit)}
                  disabled={updateLoading}>
                  {updateLoading ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : (
                    'Update Group'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
