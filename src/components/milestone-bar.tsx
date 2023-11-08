import { cn } from '@/lib/utils';

export default function MilestoneBar({
  className,
  milestone,
}: {
  className?: string;
  milestone: string;
}) {
  const milestonesData = [
    { name: 'Topic Approval', percent: 10 },
    { name: 'Proposal Paper', percent: 20 },
    { name: 'Proposal Defense', percent: 30 },
    { name: 'Revisions Chapt 1-3', percent: 40 },
    { name: 'Compliance Approval', percent: 50 },
    { name: 'Chapter 4-5', percent: 60 },
    { name: 'Final Defense', percent: 70 },
    { name: 'Final Revisions', percent: 80 },
    { name: 'Library', percent: 100 },
  ];

  const currMilestone = milestonesData.find((mil) => mil.name === milestone);

  return (
    <>
      <div
        className={cn(
          'h-2 relative w-full rounded-full bg-zinc-300',
          className,
        )}>
        <div
          className={cn('absolute rounded-full bg-primary h-full')}
          style={{
            width: currMilestone?.percent + '%',
          }}
        />
      </div>
      <p className='text-xs pt-2 text-zinc-400 text-center'>
        {currMilestone?.name}
      </p>
    </>
  );
}
