import { trpc } from '@/app/_trpc/client';
import { DataTableFacetedFilter } from '@/components/data-table-faceted-filter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table } from '@tanstack/react-table';

export default function TableToolbar<TData>({
  table,
}: {
  table: Table<TData>;
}) {
  const isFiltered = table.getState().columnFilters.length > 0;

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
