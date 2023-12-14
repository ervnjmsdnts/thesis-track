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
import { Home, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  sectionId: z.string().min(1),
});

type Schema = z.infer<typeof schema>;

export default function UpdateStudentSection({
  currSectionId,
  userId,
}: {
  currSectionId: string;
  userId: string;
}) {
  const [open, setOpen] = useState(false);

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { sectionId: currSectionId },
  });

  const util = trpc.useUtils();

  const { data: sections, isLoading: sectionLoading } =
    trpc.section.getAll.useQuery();

  const { mutate: updateSection, isLoading: updateLoading } =
    trpc.user.updateSection.useMutation({
      onSuccess: () => {
        util.user.getAll.invalidate();
        setOpen(false);
      },
    });

  const submit = (data: Schema) => {
    updateSection({ userId, sectionId: data.sectionId });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className='flex flex-row gap-2 items-center text-sm'>
          <Home className='w-4 h-4 text-muted-foreground' />
          Update Section
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Section</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(submit)}
          className='flex flex-col gap-4 w-full'>
          <Controller
            control={form.control}
            name='sectionId'
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                disabled={sectionLoading || updateLoading}
                defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder='Set section' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sections</SelectLabel>
                    {sections?.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          <Button
            className='self-end'
            disabled={sectionLoading || updateLoading}>
            {updateLoading ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              'Save'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
