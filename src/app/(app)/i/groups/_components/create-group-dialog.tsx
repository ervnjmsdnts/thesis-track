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
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1),
  adviserId: z.string().optional(),
});

type Schema = z.infer<typeof schema>;

export default function CreateGroupDialog({
  groupTitles,
}: {
  groupTitles: (string | null)[];
}) {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);

  const util = trpc.useUtils();

  const { data: users, isLoading: userLoading } = trpc.user.getAll.useQuery();

  const advisers = users?.filter((user) => user.role === 'ADVISER');

  const form = useForm<Schema>({ resolver: zodResolver(schema) });

  const { toast } = useToast();

  const { mutate: createGroup, isLoading } =
    trpc.group.createGroupByInstructor.useMutation({
      onSuccess: () => {
        util.group.getAll.invalidate();
        setOpen(false);
        form.reset({ adviserId: '', title: '' });
        setSelectedUsers([]);
      },
    });

  const submit = async (data: Schema) => {
    const isGroupTitleExist = groupTitles.some((title) => title === data.title);
    if (isGroupTitleExist) {
      return toast({
        title: 'Existing',
        description: 'The title you entered already exists',
        variant: 'destructive',
      });
    }
    return createGroup({
      title: data.title,
      members: selectedUsers,
      adviserId: data.adviserId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Group</Button>
      </DialogTrigger>
      <DialogContent className='w-full'>
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
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
              />
            </div>
            <div className='flex justify-end mt-4'>
              <Button onClick={form.handleSubmit(submit)} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  'Create Group'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
