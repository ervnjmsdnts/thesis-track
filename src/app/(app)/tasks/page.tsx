import { db } from '@/db';
import TaskBoard from './(components)/task-board';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';

export default async function Tasks() {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user || !user.id) return redirect('/auth-callback?origin=dashboard');

  const dbUser = await db.user.findFirst({
    where: { id: user.id },
    include: { group: true },
  });

  const group = await db.group.findFirst({
    where: { id: dbUser?.group[0].id },
    include: { members: true, tasks: true },
  });

  if (!group) return;

  return (
    <div className='flex flex-col h-full'>
      <TaskBoard group={group} />
    </div>
  );
}
