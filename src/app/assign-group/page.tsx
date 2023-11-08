import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/server';
import AssignGroup from './(components)/assign-group';
import { Button } from '@/components/ui/button';
import { db } from '@/db';
import { Group } from '@prisma/client';

export default async function AssignGroupPage() {
  const groups = await db.group.findMany();

  let groupTitles: (string | null)[] = [];

  if (groups && groups.length > 0) {
    groupTitles = groups.map((group) => group.title);
  }

  return (
    <div className='flex flex-col h-full p-4 w-full'>
      <div className='flex justify-end'>
        <Button asChild variant='outline'>
          <LogoutLink>Logout</LogoutLink>
        </Button>
      </div>
      <div className='flex-grow'>
        <AssignGroup groupTitles={groupTitles} />
      </div>
    </div>
  );
}
