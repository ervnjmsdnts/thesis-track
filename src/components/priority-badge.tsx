import { cn, toTitleCase } from '@/lib/utils';
import { Badge } from './ui/badge';
import { TaskPriority } from '@prisma/client';

export default function PriorityBadge({
  priority,
}: {
  priority: TaskPriority;
}) {
  return (
    <Badge
      className={cn(
        priority === 'LOW'
          ? 'bg-green-200 hover:bg-green-100 text-green-800'
          : priority === 'MEDIUM'
          ? 'bg-yellow-200 hover:bg-yellow-100 text-yellow-800'
          : 'bg-red-200 hover:bg-red-100 text-red-800',
      )}>
      {toTitleCase(priority)}
    </Badge>
  );
}
