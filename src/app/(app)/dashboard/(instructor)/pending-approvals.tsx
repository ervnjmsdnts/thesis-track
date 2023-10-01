import { Button } from '@/components/ui/button';
import Link from 'next/link';

function Approval() {
  return (
    <div className='border p-3 rounded-lg'>
      <div className='flex items-center justify-between'>
        <div>
          <h4 className='font-medium'>Thesis Title</h4>
          <p className='text-zinc-500 text-xs font-medium'>
            Submitted: 02-01-2023
          </p>
        </div>
        <Button asChild variant='outline'>
          <Link href='/'>View</Link>
        </Button>
      </div>
    </div>
  );
}

export default function PendingApprovals() {
  return (
    <div className='flex flex-col flex-grow h-0 overflow-y-auto gap-4'>
      <Approval />
      <Approval />
      <Approval />
      <Approval />
      <Approval />
      <Approval />
    </div>
  );
}
