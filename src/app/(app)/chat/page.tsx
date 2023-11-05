import { db } from '@/db';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';
import Chat from './(components)/chat';
import StaffChat from './(components)/staff-chat';

export default async function ChatPage() {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user || !user.id) return redirect('/auth-callback?origin=dashboard');

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
    include: { group: true },
  });

  if (!dbUser || !dbUser.role || !dbUser.id)
    redirect('/auth-callback?origin=dashboard');

  const group = await db.group.findFirst({
    where: { id: dbUser?.group[0].id },
    include: {
      members: true,
      tasks: true,
    },
  });

  if (!group || !group.id) redirect('/auth-callback?origin=dashboard');

  if (dbUser.role === 'ADVISER') {
    return <StaffChat userRole={dbUser.role} userId={dbUser.id} />;
  } else {
    return <Chat userId={dbUser.id} groupId={group.id} />;
  }
}
