'use client';

import { trpc } from '@/app/_trpc/client';
import { DataTableFacetedFilter } from '@/components/data-table-faceted-filter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table } from '@tanstack/react-table';

export default function UserTableToolbar<TData>({
  table,
}: {
  table: Table<TData>;
}) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const { data: dbSections } = trpc.section.getAll.useQuery();

  const sections = dbSections?.map((s) => ({
    label: s.name,
    value: s.name,
  }));

  return (
    <div className='flex gap-2 items-center'>
      <Input
        placeholder='Filter name...'
        value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
        onChange={(event) =>
          table.getColumn('name')?.setFilterValue(event.target.value)
        }
        className='h-8 w-[250px]'
      />
      {table.getColumn('section_name') && sections ? (
        <DataTableFacetedFilter
          column={table.getColumn('section_name')}
          title='Section'
          options={sections}
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
