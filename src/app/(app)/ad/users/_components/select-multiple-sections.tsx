'use client';

import { trpc } from '@/app/_trpc/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Section } from '@prisma/client';
import { CheckCheck, Loader2, PlusCircle } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

export default function SelectMultipleSections({
  selectedSections,
  setSelectedSections,
  currentSections,
}: {
  selectedSections: Section[];
  setSelectedSections: Dispatch<SetStateAction<Section[]>>;
  currentSections?: Section[];
}) {
  const { data: sections, isLoading } = trpc.section.getAll.useQuery();
  const [open, setOpen] = useState(false);
  const [searchSection, setSearchSection] = useState('');

  useEffect(() => {
    if (currentSections && currentSections.length > 0) {
      setSelectedSections(currentSections);
    }
  }, [currentSections, setSelectedSections]);

  const filteredSections = useMemo(() => {
    return !searchSection
      ? sections
      : sections?.filter((section) => {
          return section.name
            .toLowerCase()
            .includes(searchSection.toLowerCase());
        });
  }, [searchSection, sections]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='h-8 w-full border-dashed'>
          <PlusCircle className='mr-2 h-4 w-4' />
          Select Sections
          {selectedSections?.length > 0 && (
            <>
              <Separator orientation='vertical' className='mx-2 h-4' />
              <Badge
                variant='secondary'
                className='rounded-sm px-1 font-normal lg:hidden'>
                {selectedSections.length}
              </Badge>
              <div className='hidden space-x-1 lg:flex'>
                {selectedSections.length > 2 ? (
                  <Badge
                    variant='secondary'
                    className='rounded-sm px-1 font-normal'>
                    {selectedSections.length} selected
                  </Badge>
                ) : (
                  filteredSections
                    ?.filter((section) =>
                      selectedSections.find((su) => su.name === section.name),
                    )
                    .map((option) => (
                      <Badge
                        variant='secondary'
                        key={option.name}
                        className='rounded-sm px-1 font-normal'>
                        {option.name}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[400px] p-0'>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder='Select Members'
            value={searchSection}
            onValueChange={(search) => setSearchSection(search)}
          />
          <CommandList>
            <CommandGroup>
              {filteredSections && filteredSections.length > 0 ? (
                filteredSections.map((section) => {
                  const isSelected = selectedSections.some(
                    (su) => su.name === section.name,
                  );
                  return (
                    <CommandItem
                      key={section.name}
                      value={section.name}
                      onSelect={() => {
                        if (isSelected) {
                          setSelectedSections((prev) =>
                            prev.filter((p) => p.name !== section.name),
                          );
                        } else {
                          setSelectedSections((prev) => [
                            ...prev,
                            {
                              ...section,
                            },
                          ]);
                        }
                      }}>
                      <CheckCheck
                        className={cn(
                          'mr-2 h-4 w-4',
                          isSelected ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <p>
                        <span className='font-medium'>{section.name}</span>
                      </p>
                    </CommandItem>
                  );
                })
              ) : isLoading ? (
                <div className='flex justify-center py-4 w-full'>
                  <Loader2 className='w-6 h-6 animate-spin' />
                </div>
              ) : (
                <p className='text-center text-sm py-4'>No section found</p>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
