'use client';

import { trpc } from '@/app/_trpc/client';
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs/server';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InviteContent({
  userSession,
  userId,
  groupId,
  groupTitle,
}: {
  userSession: KindeUser;
  userId: string;
  groupId: string;
  groupTitle: string;
}) {
  const router = useRouter();

  const handleRedirect = () => {
    setTimeout(() => {
      router.replace('/dashboard');
    }, 3000); // 3000 milliseconds = 3 seconds
  };

  const { isLoading } = trpc.group.acceptInvitation.useQuery(
    {
      groupId,
      userId,
    },
    { onSuccess: () => handleRedirect() },
  );
  return (
    <div>
      {isLoading ? (
        <p className='text-2xl flex items-end gap-1'>
          Joining <span className='font-semibold'>{groupTitle}</span>
          <span className='h-1 w-1 mb-2 bg-black rounded-full animate-pulse [animation-delay:-0.3s]'></span>
          <span className='h-1 w-1 mb-2 bg-black rounded-full animate-pulse [animation-delay:-0.15s]'></span>
          <span className='h-1 w-1 mb-2 bg-black rounded-full animate-pulse'></span>
        </p>
      ) : (
        <div className='flex flex-col gap-4 items-center'>
          <h2 className='text-2xl font-semibold'>Accepted Invitation</h2>
          <div className='flex items-center gap-1.5'>
            <Loader2 className='h-4 w-4 animate-spin' /> Redirecting
          </div>
        </div>
      )}
    </div>
  );
}
