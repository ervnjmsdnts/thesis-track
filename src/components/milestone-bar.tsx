import { cn } from '@/lib/utils';
import { Progression } from '@/types/progress';

export default function MilestoneBar({
  className,
  milestone,
}: {
  className?: string;
  milestone: string;
}) {
  const milestonesData: { name: Progression; percent: number }[] = [
    { name: 'Topic Approval', percent: 10 },
    { name: 'Adviser Invitation', percent: 15 },
    { name: 'Chapt 1-3', percent: 20 },
    { name: 'Chapt 1-3 Approval', percent: 25 },
    { name: 'Proposal Paper Forms', percent: 30 },
    { name: 'Proposal Defense', percent: 35 },
    { name: 'Compliance Matrix (Proposal)', percent: 40 },
    { name: 'Revisions Chapt 1-3', percent: 50 },
    { name: 'System Development', percent: 55 },
    { name: 'Compliance Matrix Approval (Proposal)', percent: 60 },
    { name: 'Chapt 4-5', percent: 70 },
    { name: 'Oral Defense Form', percent: 75 },
    { name: 'Oral Defense', percent: 80 },
    { name: 'Compliance Matrix (Oral)', percent: 85 },
    { name: 'Capstone Paper Revisions', percent: 90 },
    { name: 'Compliance Matrix Approval (Oral)', percent: 95 },
    { name: 'Library Hardbound', percent: 100 },
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
