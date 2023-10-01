import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function Milestone() {
  return (
    <div className='h-2 relative w-full rounded-full bg-zinc-300'>
      <div className='absolute rounded-full bg-green-400 w-[10%] h-2'></div>
      <p className='text-xs pt-2 text-zinc-400 text-center'>Proposal Defense</p>
    </div>
  );
}

function Group() {
  const maxItems = 4;
  const items = new Array(7).fill({ test: 1 });
  return (
    <div className='border p-3 rounded-lg'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg truncate w-96'>
          Thesis title Lorem ipsum dolor sit amet consectetur adipisicing elit.
          Maxime voluptate incidunt a magnam inventore repudiandae optio libero,
          placeat magni deserunt aperiam dolorum. Ut, quidem! Molestiae quos,
          quasi commodi, animi officia minima impedit aperiam facilis ab
          voluptatum voluptas fugiat laboriosam ducimus aliquid recusandae
          ipsum, reiciendis veniam maxime esse nesciunt. Rem, ratione!
        </h3>
        {/* Avatar group */}
        <div className='flex -space-x-2'>
          {items.slice(0, maxItems).map((_, index) => (
            <Avatar key={index} className='ring-2 ring-primary'>
              <AvatarFallback>EJ</AvatarFallback>
            </Avatar>
          ))}
          {items.length > maxItems && (
            <Avatar className='ring-2 ring-primary'>
              <AvatarFallback>+{items.length - maxItems}</AvatarFallback>
            </Avatar>
          )}
        </div>
        <div className='max-w-xs w-full'>
          <Milestone />
        </div>
        {/* View */}
        <Button asChild>
          <Link href='/group'>View</Link>
        </Button>
      </div>
    </div>
  );
}

export default function Groups() {
  return (
    <div className='flex flex-col h-0 overflow-y-auto flex-grow gap-4'>
      <Group />
      <Group />
      <Group />
      <Group />
      <Group />
      <Group />
      <Group />
      <Group />
      <Group />
      <Group />
      <Group />
    </div>
  );
}
