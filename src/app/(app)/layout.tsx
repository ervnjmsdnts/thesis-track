import AppNavbar from '@/components/app-navbar';
import InstructorSidebar from '@/components/instructor-sidebar';
import { db } from '@/db';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user || !user.id) redirect('/auth-callback?origin=dashboard');

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
    include: { group: true },
  });

  if (!dbUser) return redirect('/auth-callback');
  if (dbUser.role === 'STUDENT') {
    if (!dbUser.sectionId) return redirect('/choose-section');
    if (dbUser.group.length === 0) return redirect('/assign-group');
  }

  return (
    <div className='flex flex-col h-full'>
      <AppNavbar user={dbUser} />
      <InstructorSidebar user={dbUser}>{children}</InstructorSidebar>
    </div>
  );
}
