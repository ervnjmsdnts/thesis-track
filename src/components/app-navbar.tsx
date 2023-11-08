import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/server';
import { User } from '@prisma/client';
import Image from 'next/image';

export default function AppNavbar({ user }: { user: User }) {
  return (
    <nav className='flex border-b p-4 justify-between items-center'>
      <div className='flex items-center gap-2'>
        <div className='relative h-12 w-12'>
          <Image fill src='/cics-logo.png' alt='CICS' />
        </div>
        <h1 className='font-bold text-2xl text-primary'>ThesisTrack</h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar>
            <AvatarImage src={user?.picture as string | undefined} />
            <AvatarFallback>
              {user.firstName[0]}
              {user.lastName[0]}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56 my-1 mx-2'>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <LogoutLink>Log out</LogoutLink>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
