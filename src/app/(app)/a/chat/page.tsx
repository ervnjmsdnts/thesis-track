import { db } from '@/db';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';
import AdviserChat from './_components/adviser-chat';

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

  if (!dbUser || !dbUser.id) redirect('/auth-callback');

  return <AdviserChat userId={dbUser.id} />;
}
