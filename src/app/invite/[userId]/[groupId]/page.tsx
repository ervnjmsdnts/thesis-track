import InviteContent from './(components)/invite-content';
import { db } from '@/db';
import { notFound } from 'next/navigation';
import Logo from './(components)/logo';

export default async function InvitePage({
  params,
}: {
  params: { userId: string; groupId: string };
}) {
  const { userId, groupId } = params;

  const group = await db.group.findFirst({ where: { id: groupId } });

  if (!group || !group.title || !group.title) return notFound();

  const user = await db.user.findFirst({ where: { id: userId } });

  if (!user || !user.id) return notFound();

  return (
    <div className='flex justify-center items-center h-full w-full'>
      <div className='space-y-2 text-center'>
        <div className='flex items-center justify-center gap-2'>
          <Logo />
        </div>
        <h1 className='text-4xl font-bold text-primary'>ThesisTrack</h1>
        <InviteContent
          userId={user.id}
          groupId={group.id}
          groupTitle={group.title}
        />
      </div>
    </div>
  );
}
