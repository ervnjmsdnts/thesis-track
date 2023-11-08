import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import StudentDashboard from './(student)';
import StaffDashboard from './(staff)';

export default async function Dashboard() {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user || !user.id) return redirect('/auth-callback?origin=dashboard');

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!dbUser || !dbUser.role || !dbUser.id) return redirect('/auth-callback');

  const group = await db.group.findFirst({
    where: { members: { some: { id: dbUser.id } } },
  });

  if (!group || !group.id) return redirect('/auth-callback');

  return (
    <div className='flex flex-col h-full'>
      {dbUser.role === 'STUDENT' ? (
        <StudentDashboard groupId={group.id} userId={dbUser.id} />
      ) : null}
      {dbUser.role === 'INSTRUCTOR' || dbUser.role === 'ADVISER' ? (
        <StaffDashboard userRole={dbUser.role} userId={dbUser.id} />
      ) : null}
    </div>
  );
}
