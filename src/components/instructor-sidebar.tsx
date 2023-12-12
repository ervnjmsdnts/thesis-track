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
import { Badge } from './ui/badge';
import { cn, toTitleCase } from '@/lib/utils';

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
          <div className='mb-4 p-4 border rounded-lg'>
            <h2>
              Hello! <span className='font-semibold'>{user.firstName}</span>
            </h2>
            <p
              className={cn(
                'text-xs font-medium',
                user.role === 'ADMIN'
                  ? 'text-purple-500'
                  : user.role === 'ADVISER'
                  ? 'text-yellow-500'
                  : user.role === 'INSTRUCTOR'
                  ? 'text-primary'
                  : 'text-green-500',
              )}>
              {toTitleCase(user.role)}
            </p>
          </div>
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
