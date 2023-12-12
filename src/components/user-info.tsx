import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function UserInfo({
  picture,
  name,
  email,
  fallback,
  section,
}: {
  picture: string | null;
  name: string;
  fallback: string;
  email: string;
  section?: string | null;
}) {
  return (
    <div className='flex items-center gap-2'>
      <Avatar>
        <AvatarImage src={picture as string | undefined} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <div className='text-xs'>
        <p className='font-medium'>
          {name} {section ? `| ${section}` : null}
        </p>
        <p>{email}</p>
      </div>
    </div>
  );
}
