import { db } from '@/db';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';
import Timeline from './(components)/timeline';

export default async function TimelinePage() {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user || !user.id) return redirect('/auth-callback?origin=dashboard');

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
    include: { group: true },
  });

  if (!dbUser || !dbUser.role || !dbUser.id)
    redirect('/auth-callback?origin=dashboard');

  const tasks = await db.task.findMany({
    where: { groupId: dbUser.group[0].id },
  });

  return <Timeline tasks={tasks} />;
}
