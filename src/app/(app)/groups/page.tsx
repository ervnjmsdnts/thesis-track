import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import GroupsTable from './components/groups-table';
import { redirect } from 'next/navigation';
import { db } from '@/db';

export default async function Groups() {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user || !user.id) return redirect('/auth-callback?origin=dashboard');

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!dbUser || !dbUser.role) redirect('/auth-callback?origin=dashboard');

  return (
    <div className='w-full h-full'>
      <GroupsTable userRole={dbUser.role} userId={dbUser.id} />
    </div>
  );
}
