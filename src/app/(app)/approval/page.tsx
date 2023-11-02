import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import Approval from './(components)/approval';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import StaffApproval from './(components)/staff-approval';

export default async function ApprovalPage() {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user || !user.id) return redirect('/auth-callback?origin=dashboard');

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!dbUser || !dbUser.role || !dbUser.id)
    redirect('/auth-callback?origin=dashboard');

  if (dbUser.role === 'STUDENT') {
    return <Approval />;
  } else {
    return <StaffApproval userRole={dbUser.role} userId={dbUser.id} />;
  }
}
