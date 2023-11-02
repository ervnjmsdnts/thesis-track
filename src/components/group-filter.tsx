'use client';

import { Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Toggle } from './ui/toggle';
import { Group } from '@prisma/client';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

function useDebounce(value: string, time = 300) {
  const [debounceValue, setDebounceValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounceValue(value);
    }, time);

    return () => {
      clearTimeout(timeout);
    };
  }, [value, time]);

  return debounceValue.toLowerCase();
}

export default function GroupFilter({
  filteredGroup,
  selectedGroup,
  setSelectedGroup,
}: {
  filteredGroup: Group[];
  selectedGroup: string | undefined;
  setSelectedGroup: Dispatch<SetStateAction<string | undefined>>;
}) {
  const [filterText, setFilterText] = useState('');
  const [groups, setGroups] = useState(filteredGroup);

  const debouncedText = useDebounce(filterText);

  useEffect(() => {
    const filtered = filteredGroup.filter(
      (group) =>
        group.title && group.title.toLowerCase().includes(debouncedText),
    );
    setGroups(filtered);
  }, [debouncedText, filteredGroup]);

  return (
    <div className='border-r pr-4 flex flex-col gap-2 w-72'>
      <h2 className='font-semibold'>Groups</h2>
      <div className='flex items-center'>
        <Input
          className='h-8'
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder='Enter thesis title...'
        />
        {/* <Popover>
          <PopoverTrigger asChild>
            <Button variant='ghost' className='text-zinc-500'>
              <Filter className='w-4 h-4' />
            </Button>
          </PopoverTrigger>
          <PopoverContent>Filter</PopoverContent>
        </Popover> */}
      </div>
      <div className='grid gap-1.5 h-0 flex-grow overflow-y-auto'>
        {groups.map((group) => (
          <Toggle
            key={group.id}
            pressed={group.id === selectedGroup}
            onPressedChange={() =>
              setSelectedGroup((prev) =>
                prev === group.id ? undefined : group.id,
              )
            }
            className='truncate px-2 justify-start w-full'>
            {group.title}
          </Toggle>
        ))}
      </div>
    </div>
  );
}