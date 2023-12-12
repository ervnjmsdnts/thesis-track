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

  const { data: groups } = trpc.group.getAll.useQuery();

  const mappedGroups = groups?.map((group) => ({
    label: group.title,
    value: group.title,
  }));

  const progressions: { label: Progression; value: Progression }[] = [
    { label: 'Topic Approval', value: 'Topic Approval' },
    { label: 'Proposal Paper', value: 'Proposal Paper' },
    { label: 'Proposal Defense', value: 'Proposal Defense' },
    { label: 'Revisions Chapt 1-3', value: 'Revisions Chapt 1-3' },
    { label: 'Compliance Approval', value: 'Compliance Approval' },
    { label: 'Chapter 4-5', value: 'Chapter 4-5' },
    { label: 'Final Defense', value: 'Final Defense' },
    { label: 'Final Revisions', value: 'Final Revisions' },
    { label: 'Library', value: 'Library' },
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
