'use client';
import { trpc } from '@/app/_trpc/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { Role } from '@prisma/client';
import { Loader2, Pencil } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  role: z.enum(['ADMIN', 'ADVISER', 'INSTRUCTOR', 'STUDENT']),
});

type Schema = z.infer<typeof schema>;

export default function UpdateRole({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: Role;
}) {
  const [open, setOpen] = useState(false);

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { role: currentRole },
  });

  const util = trpc.useUtils();

  const { mutate: updateRole, isLoading } = trpc.user.updateRole.useMutation({
    onSuccess: () => {
      util.user.getAll.invalidate();
      setOpen(false);
    },
  });

  const submit = (data: Schema) => {
    updateRole({ userId, role: data.role });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className='flex flex-row gap-2 items-center text-sm'>
          <Pencil className='w-4 h-4 text-muted-foreground' />
          Edit Role
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className='w-full'>
        <DialogHeader>
          <DialogTitle>Update Role</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4'>
          <Controller
            control={form.control}
            name='role'
            render={({ field }) => (
              <Select defaultValue={field.value} onValueChange={field.onChange}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select role...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Roles</SelectLabel>
                    <SelectItem value='STUDENT'>Student</SelectItem>
                    <SelectItem value='ADVISER'>Adviser</SelectItem>
                    <SelectItem value='INSTRUCTOR'>Instructor</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          <Button
            className='self-end'
            onClick={form.handleSubmit(submit)}
            disabled={isLoading}>
            {isLoading ? <Loader2 className='w-4 h-4 animate-spin' /> : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
