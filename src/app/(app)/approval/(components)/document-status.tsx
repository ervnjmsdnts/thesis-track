import { Badge } from '@/components/ui/badge';
import { cn, toTitleCase } from '@/lib/utils';
import { DocumentStatus } from '@prisma/client';

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <Badge
      className={cn(
        status === 'REJECTED'
          ? 'bg-red-200 hover:bg-red-100 text-red-800'
          : status === 'APPROVED'
          ? 'bg-green-200 hover:bg-green-100 text-green-800'
          : 'bg-zinc-200 hover:bg-zinc-100 text-zinc-800',
      )}>
      {toTitleCase(status)}
    </Badge>
  );
}
