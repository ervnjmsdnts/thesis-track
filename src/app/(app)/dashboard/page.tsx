import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import InstructorDashboard from './(instructor)';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import StudentDashboard from './(student)';

export default async function Dashboard() {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user || !user.id) return redirect('/auth-callback?origin=dashboard');

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) return redirect('/auth-callback');

  return (
    <div className='flex flex-col h-full'>
      {dbUser.role === 'STUDENT' ? <StudentDashboard /> : null}
      {/* <InstructorDashboard /> */}
    </div>
  );
}
