import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export default function Message({
  userId,
  authorId,
  content,
  firstName,
  lastName,
}: {
  userId: string;
  authorId: string;
  content: string;
  firstName: string;
  lastName: string;
}) {
  const isAuthor = userId === authorId;

  return (
    <div
      className={cn('flex gap-2', !isAuthor ? 'justify-start' : 'justify-end')}>
      {!isAuthor ? (
        <div>
          <Avatar>
            <AvatarFallback>
              {firstName[0]}
              {lastName[0]}
            </AvatarFallback>
          </Avatar>
        </div>
      ) : null}
      <div
        className={cn(
          'p-2 max-w-md rounded-br-md rounded-bl-md',
          !isAuthor
            ? 'bg-secondary rounded-tr-md rounded-br-md'
            : 'bg-primary rounded-tl-md text-white',
        )}>
        {content}
      </div>
      {isAuthor ? (
        <div>
          <Avatar>
            <AvatarFallback>
              {firstName[0]}
              {lastName[0]}
            </AvatarFallback>
          </Avatar>
        </div>
      ) : null}
    </div>
  );
}
