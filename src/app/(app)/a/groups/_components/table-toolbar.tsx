import { Input } from '@/components/ui/input';
import { Table } from '@tanstack/react-table';

export default function TableToolbar<TData>({
  table,
}: {
  table: Table<TData>;
}) {
  return (
    <Input
      placeholder='Filter title...'
      value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
      onChange={(event) =>
        table.getColumn('title')?.setFilterValue(event.target.value)
      }
      className='h-8 w-[250px]'
    />
  );
}
