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
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Pencil } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const schema = z.object({
  progression: z.enum([
    'Topic Approval',
    'Proposal Paper',
    'Proposal Defense',
    'Revisions Chapt 1-3',
    'Compliance Approval',
    'Chapter 4-5',
    'Final Defense',
    'Final Revisions',
    'Library',
  ]),
});

type Schema = z.infer<typeof schema>;

export default function ChangeProgressionDialog({
  currProgress,
  groupId,
}: {
  currProgress: string;
  groupId: string;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      progression: currProgress as
        | 'Topic Approval'
        | 'Proposal Paper'
        | 'Proposal Defense'
        | 'Revisions Chapt 1-3'
        | 'Compliance Approval'
        | 'Chapter 4-5'
        | 'Final Defense'
        | 'Final Revisions'
        | 'Library'
        | undefined,
    },
  });

  const util = trpc.useUtils();

  const { mutate: changeProgress, isLoading } =
    trpc.group.changeProgress.useMutation({
      onSuccess: () => {
        util.group.getAll.invalidate();
        setOpen(false);
      },
    });

  const submit = (data: Schema) => {
    changeProgress({ progression: data.progression, groupId });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className='justify-self-end' asChild>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className='flex flex-row gap-2 items-center text-sm'>
          <Pencil className='w-4 h-4 text-muted-foreground' />
          Change Progression
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Progression</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4'>
          <Controller
            control={form.control}
            name='progression'
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select progression...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Progressions</SelectLabel>
                    <SelectItem value='Topic Approval'>
                      Topic Approval
                    </SelectItem>
                    <SelectItem value='Proposal Paper'>
                      Proposal Paper
                    </SelectItem>
                    <SelectItem value='Proposal Defense'>
                      Proposal Defense
                    </SelectItem>
                    <SelectItem value='Revisions Chapt 1-3'>
                      Revisions Chapt 1-3
                    </SelectItem>
                    <SelectItem value='Compliance Approval'>
                      Compliance Approval
                    </SelectItem>
                    <SelectItem value='Chapter 4-5'>Chapter 4-5</SelectItem>
                    <SelectItem value='Final Defense'>Final Defense</SelectItem>
                    <SelectItem value='Final Revisions'>
                      Final Revisions
                    </SelectItem>
                    <SelectItem value='Library'>Library</SelectItem>
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
