import { cn } from '@/lib/utils';

export default function MilestoneBar({
  className,
  percent = 10,
}: {
  className?: string;
  percent?: number;
}) {
  return (
    <>
      <div
        className={cn(
          'h-2 relative w-full rounded-full bg-zinc-300',
          className,
        )}>
        <div
          className={cn('absolute rounded-full bg-primary h-full')}
          style={{ width: percent + '%' }}
        />
      </div>
      <p className='text-xs pt-2 text-zinc-400 text-center'>Proposal Defense</p>
    </>
  );
}
