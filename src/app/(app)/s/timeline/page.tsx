import { db } from '@/db';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';
import Timeline from './(components)/timeline';

export default async function Page() {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user || !user.id) return redirect('/auth-callback');

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
    include: { group: true },
  });

  if (!dbUser || !dbUser.role || !dbUser.id) redirect('/auth-callback');

  const tasks = await db.task.findMany({
    where: { groupId: dbUser.group[0].id },
  });

  return <Timeline tasks={tasks} />;
}
