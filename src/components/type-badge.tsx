import { TaskTypes } from '@prisma/client';
import { Badge } from './ui/badge';
import { cn, toTitleCase } from '@/lib/utils';

export default function TypeBadge({ type }: { type: TaskTypes }) {
  return (
    <Badge
      className={cn(
        type === 'DOCUMENTATION'
          ? 'bg-blue-200 hover:bg-blue-100 text-blue-800'
          : type === 'DEVELOPMENT'
          ? 'bg-pink-200 hover:bg-pink-100 text-pink-800'
          : type === 'DESIGN'
          ? 'bg-purple-200 hover:bg-purple-100 text-purple-800'
          : 'bg-zinc-200 hover:bg-zinc-100 text-zinc-800',
      )}>
      {toTitleCase(type)}
    </Badge>
  );
}
