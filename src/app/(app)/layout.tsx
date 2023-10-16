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
  });

  if (!dbUser) redirect('/auth-callback');

  const role = dbUser.role;

  return (
    <div className='flex flex-col h-full'>
      <AppNavbar user={dbUser} />
      <InstructorSidebar>{children}</InstructorSidebar>
    </div>
  );
}
