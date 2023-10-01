'use client';

import {
  Contact2,
  LayoutDashboard,
  MessagesSquare,
  Users2,
} from 'lucide-react';
import { ReactNode } from 'react';
import { Button } from './ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const routes = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    Icon: LayoutDashboard,
  },
  {
    href: '/chat',
    label: 'Chat',
    Icon: MessagesSquare,
  },
  {
    href: '/users',
    label: 'Users',
    Icon: Contact2,
  },
  {
    href: '/groups',
    label: 'Groups',
    Icon: Users2,
  },
];

function NavItems({ label, href, Icon }: (typeof routes)[number]) {
  const pathname = usePathname();

  return (
    <Button
      asChild
      className='justify-start gap-4'
      variant={pathname.includes(href) ? 'secondary' : 'ghost'}>
      <Link href={href}>
        <Icon />
        <p>{label}</p>
      </Link>
    </Button>
  );
}

export default function InstructorSidebar({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className='flex h-full'>
      <div className='flex-grow flex'>
        <aside className='w-72 border-r p-4'>
          <div className='flex flex-col gap-2'>
            {routes.map((route) => (
              <NavItems {...route} key={route.label} />
            ))}
          </div>
        </aside>
        <main className='flex-1 flex-grow p-4'>{children}</main>
      </div>
    </div>
  );
}
