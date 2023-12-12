'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Section } from '@prisma/client';
import { Home, Loader2 } from 'lucide-react';
import { useState } from 'react';
import SelectMultipleSections from './select-multiple-sections';
import { Button } from '@/components/ui/button';
import { trpc } from '@/app/_trpc/client';

export default function UpdateAssignedSections({
  instructorId,
  assignedSections,
}: {
  instructorId: string;
  assignedSections: Section[];
}) {
  const [open, setOpen] = useState(false);

  const util = trpc.useUtils();

  const [selectedSections, setSelectedSections] = useState<Section[]>([]);

  const { mutate: assignSection, isLoading } =
    trpc.user.assignSection.useMutation({
      onSuccess: () => {
        util.user.getAll.invalidate();
        setOpen(false);
      },
    });

  const submit = () => {
    assignSection({
      instructorId,
      sectionIds: selectedSections.map((section) => section.id),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className='flex flex-row gap-2 items-center text-sm'>
          <Home className='w-4 h-4 text-muted-foreground' />
          Assign Section
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Section</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4 w-full'>
          <SelectMultipleSections
            selectedSections={selectedSections}
            setSelectedSections={setSelectedSections}
            currentSections={assignedSections}
          />
          <Button className='self-end' onClick={submit} disabled={isLoading}>
            {isLoading ? <Loader2 className='w-4 h-4 animate-spin' /> : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
