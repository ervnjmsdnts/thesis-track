import { trpc } from '@/app/_trpc/client';
import { DataTableFacetedFilter } from '@/components/data-table-faceted-filter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progression } from '@/types/progress';
import { Table } from '@tanstack/react-table';

export default function TableToolbar<TData>({
  table,
}: {
  table: Table<TData>;
}) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const progressions: { label: Progression; value: Progression }[] = [
    { label: 'Topic Approval', value: 'Topic Approval' },
    { label: 'Adviser Invitation', value: 'Adviser Invitation' },
    { label: 'Chapt 1-3', value: 'Chapt 1-3' },
    { label: 'Chapt 1-3 Approval', value: 'Chapt 1-3 Approval' },
    { label: 'Proposal Paper Forms', value: 'Proposal Paper Forms' },
    { label: 'Proposal Defense', value: 'Proposal Defense' },
    {
      label: 'Compliance Matrix (Proposal)',
      value: 'Compliance Matrix (Proposal)',
    },
    { label: 'Revisions Chapt 1-3', value: 'Revisions Chapt 1-3' },
    { label: 'System Development', value: 'System Development' },
    {
      label: 'Compliance Matrix Approval (Proposal)',
      value: 'Compliance Matrix Approval (Proposal)',
    },
    { label: 'Chapt 4-5', value: 'Chapt 4-5' },
    { label: 'Oral Defense Form', value: 'Oral Defense Form' },
    { label: 'Oral Defense', value: 'Oral Defense' },
    { label: 'Compliance Matrix (Oral)', value: 'Compliance Matrix (Oral)' },
    { label: 'Capstone Paper Revisions', value: 'Capstone Paper Revisions' },
    {
      label: 'Compliance Matrix Approval (Oral)',
      value: 'Compliance Matrix Approval (Oral)',
    },
    { label: 'Library Hardbound', value: 'Library Hardbound' },
  ];

  return (
    <div className='flex gap-2 items-center'>
      <Input
        placeholder='Filter title...'
        value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
        onChange={(event) =>
          table.getColumn('title')?.setFilterValue(event.target.value)
        }
        className='h-8 w-[250px]'
      />
      {table.getColumn('progression') ? (
        <DataTableFacetedFilter
          column={table.getColumn('progression')}
          title='Progression'
          options={progressions}
        />
      ) : null}
      {isFiltered ? (
        <Button
          variant='ghost'
          className='h-8 px-2'
          onClick={() => table.resetColumnFilters()}>
          Reset
        </Button>
      ) : null}
    </div>
  );
}
