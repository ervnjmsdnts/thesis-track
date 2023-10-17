'use client';

import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useState } from 'react';
import { trpc } from '../_trpc/client';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

const schema = z.object({
  section: z.string(),
});

type Schema = z.infer<typeof schema>;

export default function ChooseSection() {
  const [open, setOpen] = useState(false);
  const form = useForm<Schema>({ resolver: zodResolver(schema) });

  const router = useRouter();

  const { data: dbSections } = trpc.getSections.useQuery();
  const { mutate: setUserSection, isLoading } = trpc.setUserSection.useMutation(
    {
      onSuccess: () => {
        router.replace('/assign-group');
      },
    },
  );

  const submit = (data: Schema) => {
    const sectionId = dbSections?.find(
      (s) => data.section === s.name.toLowerCase(),
    )?.id;
    setUserSection({ sectionId: sectionId! });
  };

  const sections = dbSections?.map((s) => ({
    label: s.name,
    value: s.name.toLowerCase(),
  }));

  return (
    <div className='flex flex-col items-center gap-4 justify-center h-full w-full'>
      <h2 className='text-3xl font-semibold'>Choose your section</h2>
      <Controller
        control={form.control}
        name='section'
        render={({ field }) => (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                role='combobox'
                aria-expanded={open}
                className='w-[200px] justify-between'>
                {field.value && sections
                  ? sections.find((section) => section.value === field.value)
                      ?.label
                  : 'Select section...'}
                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[200px] p-0'>
              <Command>
                <CommandInput placeholder='Search section...' />
                <CommandEmpty>No section found.</CommandEmpty>
                <CommandGroup>
                  {sections &&
                    sections.map((section) => (
                      <CommandItem
                        key={section.value}
                        value={section.value}
                        onSelect={() => {
                          form.setValue('section', section.value);
                          setOpen(false);
                        }}>
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            field.value === section.value
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                        {section.label}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      />
      <Button
        onClick={form.handleSubmit(submit)}
        disabled={!form.getValues('section') || isLoading}>
        {isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Submit'}
      </Button>
    </div>
  );
}
