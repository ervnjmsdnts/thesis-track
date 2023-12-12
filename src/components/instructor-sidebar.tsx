'use client';

import {
  Boxes,
  CalendarCheck,
  Contact2,
  FileCheck2,
  GanttChart,
  LayoutDashboard,
  LucideIcon,
  MessagesSquare,
  Users2,
} from 'lucide-react';
import { ReactNode } from 'react';
import { Button } from './ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Role, User } from '@prisma/client';

const routes: {
  href: string;
  label: string;
  Icon: LucideIcon;
  role: Role[];
}[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    Icon: LayoutDashboard,
    role: ['ADVISER', 'INSTRUCTOR', 'STUDENT', 'ADMIN'],
  },
  {
    href: '/chat',
    label: 'Chat',
    Icon: MessagesSquare,
    role: ['ADVISER', 'STUDENT'],
  },
  {
    href: '/users',
    label: 'Users',
    Icon: Contact2,
    role: ['INSTRUCTOR', 'ADMIN'],
  },
  {
    href: '/groups',
    label: 'Groups',
    Icon: Users2,
    role: ['ADVISER', 'INSTRUCTOR', 'ADMIN'],
  },
  {
    href: '/tasks',
    label: 'Tasks',
    Icon: CalendarCheck,
    role: ['STUDENT'],
  },
  {
    href: '/approval',
    label: 'Approval',
    Icon: FileCheck2,
    role: ['STUDENT', 'ADVISER'],
  },
  {
    href: '/timeline',
    label: 'Timeline',
    Icon: GanttChart,
    role: ['STUDENT'],
  },
  {
    href: '/sections',
    label: 'Sections',
    Icon: Boxes,
    role: ['ADMIN'],
  },
];

function NavItems({
  label,
  href,
  Icon,
  userRole,
}: (typeof routes)[number] & { userRole: Role }) {
  const pathname = usePathname();

  const rolePath =
    userRole === 'ADMIN'
      ? '/ad'
      : userRole === 'ADVISER'
      ? '/a'
      : userRole === 'INSTRUCTOR'
      ? '/i'
      : '/s';

  return (
    <Button
      asChild
      className='justify-start gap-4'
      variant={pathname.includes(href) ? 'secondary' : 'ghost'}>
      <Link href={`${rolePath}${href}`}>
        <Icon />
        <p>{label}</p>
      </Link>
    </Button>
  );
}

export default function InstructorSidebar({
  user,
  children,
}: {
  user: User;
  children: ReactNode;
}) {
  return (
    <div className='flex h-full'>
      <div className='flex-grow flex'>
        <aside className='w-72 border-r p-4'>
          <div className='flex flex-col gap-2'>
            {routes
              .filter((fil) => fil.role.includes(user.role!))
              .map((route) => (
                <NavItems {...route} userRole={user.role!} key={route.label} />
              ))}
          </div>
        </aside>
        <main className='flex-1 bg-gray-100 flex-grow p-4'>{children}</main>
      </div>
    </div>
  );
}
