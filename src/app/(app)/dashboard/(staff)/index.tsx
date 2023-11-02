import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CollectionMilestone from './collection-milestone';
import Groups from './groups';
import PendingApprovals from './pending-approvals';
import { Role } from '@prisma/client';

export default function StaffDashboard({
  userRole,
  userId,
}: {
  userRole: Role;
  userId: string;
}) {
  return (
    <div className='flex flex-col h-full'>
      <div className='grid grid-cols-7 flex-grow gap-4 h-full'>
        <div className='col-span-5'>
          <Card className='h-full flex flex-col'>
            <CardHeader>
              <CardTitle className='text-lg'>Groups</CardTitle>
            </CardHeader>
            <CardContent className='flex-col flex flex-grow'>
              <Groups userRole={userRole} userId={userId} />
            </CardContent>
          </Card>
        </div>
        <div className='col-span-2 grid gap-4'>
          <Card className='row-span-1'>
            <CardHeader>
              <CardTitle className='text-lg'>
                Collection of Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className='flex justify-center items-center'>
              <CollectionMilestone />
            </CardContent>
          </Card>
          <Card className='flex flex-col row-span-6'>
            <CardHeader>
              <CardTitle className='text-lg'>Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col flex-grow'>
              <PendingApprovals />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
