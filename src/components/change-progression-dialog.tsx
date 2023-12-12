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
    'Adviser Invitation',
    'Chapt 1-3',
    'Chapt 1-3 Approval',
    'Proposal Paper Forms',
    'Proposal Defense',
    'Compliance Matrix (Proposal)',
    'Revisions Chapt 1-3',
    'System Development',
    'Compliance Matrix Approval (Proposal)',
    'Chapt 4-5',
    'Oral Defense Form',
    'Oral Defense',
    'Compliance Matrix (Oral)',
    'Capstone Paper Revisions',
    'Compliance Matrix Approval (Oral)',
    'Library Hardbound',
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
        | 'Adviser Invitation'
        | 'Chapt 1-3'
        | 'Chapt 1-3 Approval'
        | 'Proposal Paper Forms'
        | 'Proposal Defense'
        | 'Compliance Matrix (Proposal)'
        | 'Revisions Chapt 1-3'
        | 'System Development'
        | 'Compliance Matrix Approval (Proposal)'
        | 'Chapt 4-5'
        | 'Oral Defense Form'
        | 'Oral Defense'
        | 'Compliance Matrix (Oral)'
        | 'Capstone Paper Revisions'
        | 'Compliance Matrix Approval (Oral)'
        | 'Library Hardbound'
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
        <div className='flex flex-col gap-4 '>
          <Controller
            control={form.control}
            name='progression'
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select progression...' />
                </SelectTrigger>
                <SelectContent className='max-h-96 overflow-y-auto'>
                  <SelectGroup>
                    <SelectLabel>Progressions</SelectLabel>
                    <SelectItem value='Topic Approval'>
                      Topic Approval
                    </SelectItem>
                    <SelectItem value='Adviser Invitation'>
                      Adviser Invitation
                    </SelectItem>
                    <SelectItem value='Chapt 1-3'>Chapt 1-3</SelectItem>
                    <SelectItem value='Chapt 1-3 Approval'>
                      Chapt 1-3 Approval
                    </SelectItem>
                    <SelectItem value='Proposal Paper Forms'>
                      Proposal Paper Forms
                    </SelectItem>
                    <SelectItem value='Proposal Defense'>
                      Proposal Defense
                    </SelectItem>
                    <SelectItem value='Revisions Chapt 1-3'>
                      Revisions Chapt 1-3
                    </SelectItem>
                    <SelectItem value='System Development'>
                      System Development
                    </SelectItem>
                    <SelectItem value='Compliance Matrix Approval (Proposal)'>
                      Compliance Matrix Approval (Proposal)
                    </SelectItem>
                    <SelectItem value='Chapt 4-5'>Chapt 4-5</SelectItem>
                    <SelectItem value='Oral Defense Form'>
                      Oral Defense Form
                    </SelectItem>
                    <SelectItem value='Oral Defense'>Oral Defense</SelectItem>
                    <SelectItem value='Compliance Matrix (Oral)'>
                      Compliance Matrix (Oral)
                    </SelectItem>
                    <SelectItem value='Capstone Paper Revisions'>
                      Capstone Paper Revisions
                    </SelectItem>
                    <SelectItem value='Compliance Matrix Approval (Oral)'>
                      Compliance Matrix Approval (Oral)
                    </SelectItem>
                    <SelectItem value='Library Hardbound'>
                      Library Hardbound
                    </SelectItem>
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
