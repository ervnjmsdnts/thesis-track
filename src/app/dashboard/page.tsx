import { Button } from '@/components/ui/button';
import { db } from '@/db';
import {
  LogoutLink,
  getKindeServerSession,
} from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user || !user.id) redirect('/auth-callback?origin=dashboard');

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) redirect('/auth-callback?origin=dashboard');

  return (
    <div>
      <Button asChild className='bg-red-500'>
        <LogoutLink>Log out</LogoutLink>
      </Button>
    </div>
  );
}
