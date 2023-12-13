import { Button } from '@/components/ui/button';
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/server';
import ChooseSection from './_components/choose-section';

export default function Page() {
  return (
    <div className='flex flex-col h-full p-4 w-full'>
      <div className='flex justify-end'>
        <Button asChild variant='outline'>
          <LogoutLink>Logout</LogoutLink>
        </Button>
      </div>
      <div className='flex-grow'>
        <ChooseSection />
      </div>
    </div>
  );
}
