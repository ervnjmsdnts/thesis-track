'use client';

import { trpc } from '@/app/_trpc/client';
import DataTable from '@/components/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Ghost, Loader2 } from 'lucide-react';
import { columns } from '../columns';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

const schema = z.object({ name: z.string().min(1) });

type Schema = z.infer<typeof schema>;

function AddSectionDialog() {
  const [open, setOpen] = useState(false);
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
  });

  const util = trpc.useUtils();

  const { mutate: createSection, isLoading } =
    trpc.section.createSection.useMutation({
      onSuccess: () => {
        util.section.getAll.invalidate();
        setOpen(false);
      },
    });

  const submit = (data: Schema) => {
    createSection({ name: data.name });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='self-end' variant='outline'>
          Add Section
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>Add Section</DialogHeader>
        <div className='flex flex-col gap-4'>
          <Input placeholder='Enter name...' {...form.register('name')} />
          <Button
            className='self-end'
            onClick={form.handleSubmit(submit)}
            disabled={isLoading}>
            {isLoading ? <Loader2 className='w-4 h-4 animate-spin' /> : 'Add'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SectionsTable() {
  const { data, isLoading } = trpc.section.getAll.useQuery();
  return (
    <>
      {data && data.length > 0 ? (
        <div className='flex flex-col gap-4 h-full'>
          <AddSectionDialog />
          <div className='flex-grow'>
            <DataTable
              data={data.map((d) => ({
                ...d,
              }))}
              columns={columns}
            />
          </div>
        </div>
      ) : isLoading ? (
        <Skeleton className='w-full h-full' />
      ) : (
        <div className='flex flex-col items-center'>
          <Ghost className='h-8 w-8 text-gray-500' />
          <p className='text-gray-500 text-sm font-medium'>No Groups</p>
        </div>
      )}
    </>
  );
}
