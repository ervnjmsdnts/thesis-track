import { db } from '@/db';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';
import StudentChat from './_components/chat';

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

  const group = await db.group.findFirst({
    where: { id: dbUser?.group[0].id },
    include: {
      members: true,
      tasks: true,
    },
  });

  if (!group || !group.id) redirect('/auth-callback');

  return <StudentChat groupId={group.id} userId={dbUser.id} />;
}
