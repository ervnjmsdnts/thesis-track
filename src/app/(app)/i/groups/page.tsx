import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import AdviserGroupsTable from './_components/adviser-groups-table';

export default async function Page() {
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
      <AdviserGroupsTable userId={dbUser.id} />
    </div>
  );
}
