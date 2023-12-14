import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Section } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil } from 'lucide-react';
import ChangeNameDialog from './(component)/change-name-dialog';

export const columns: ColumnDef<Section>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      return <p className='font-semibold w-[600px]'>{row.original.name}</p>;
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <ChangeNameDialog
              oldName={row.original.name}
              sectionId={row.original.id}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
