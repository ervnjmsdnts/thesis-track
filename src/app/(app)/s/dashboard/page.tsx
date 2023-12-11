import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import StudentDashboard from './_components/student-dashboard';
import { redirect } from 'next/navigation';
import { db } from '@/db';

export default async function Page() {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user || !user.id) return redirect('/auth-callback?origin=s/dashboard');

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!dbUser || !dbUser.role || !dbUser.id)
    return redirect('/auth-callback?origin=s/dashboard');

  const group = await db.group.findFirst({
    where: { members: { some: { id: dbUser.id } } },
  });

  if (!group || !group.id) return redirect('/auth-callback?origin=s/dashboard');

  return <StudentDashboard groupId={group.id} userId={dbUser.id} />;
}
