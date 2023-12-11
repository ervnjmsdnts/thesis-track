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
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({ name: z.string().min(1) });

type Schema = z.infer<typeof schema>;

export default function ChangeNameDialog({
  oldName,
  sectionId,
}: {
  oldName: string;
  sectionId: string;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { name: oldName },
  });

  const util = trpc.useUtils();

  const { mutate: updateSection, isLoading } =
    trpc.section.updateSection.useMutation({
      onSuccess: () => {
        util.section.getAll.invalidate();
        setOpen(false);
      },
    });

  const submit = (data: Schema) => {
    updateSection({ name: data.name, sectionId });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className='justify-self-end' asChild>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className='flex flex-row gap-2 items-center text-sm'>
          <Pencil className='w-4 h-4 text-muted-foreground' />
          Change Name
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Name</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4'>
          <Input placeholder='Enter name...' {...form.register('name')} />
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
