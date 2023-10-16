'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Role } from '@prisma/client';
import Image from 'next/image';
import { useState } from 'react';
import { trpc } from '../_trpc/client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ChooseRole() {
  const [role, setRole] = useState<Role | null>(null);

  const router = useRouter();

  const { mutate: setUserRole, isLoading } = trpc.setUserRole.useMutation({
    onSuccess: () => {
      if (role === 'ADVISER') {
        router.replace('/dashboard');
      }
      if (role === 'STUDENT') {
        router.replace('/choose-section');
      }
    },
  });

  return (
    <div className='flex h-full w-full flex-col justify-center items-center'>
      <h2 className='text-3xl font-semibold mb-2'>Choose your role</h2>
      <p className='text-xl text-gray-400 mb-4'>I am a/an...</p>
      <div className='grid gap-4 grid-cols-2'>
        <div className='flex flex-col gap-2'>
          <div
            onClick={() => setRole('STUDENT')}
            className={cn(
              'p-8 h-full cursor-pointer rounded-lg border flex justify-center items-center flex-col',
              role === 'STUDENT'
                ? 'border-primary'
                : 'border-muted-foreground/20',
            )}>
            <Image src='/student.svg' width={300} height={300} alt='student' />
          </div>
          <p
            className={cn(
              'text-center',
              role === 'STUDENT' ? 'text-primary' : 'text-muted-foreground/80',
            )}>
            Student
          </p>
        </div>
        <div className='flex flex-col gap-2'>
          <div
            onClick={() => setRole('ADVISER')}
            className={cn(
              'p-8 flex-col cursor-pointer border rounded-lg flex justify-center items-center',
              role === 'ADVISER'
                ? 'border-primary'
                : 'border-muted-foreground/20',
            )}>
            <Image src='/adviser.svg' width={400} height={400} alt='adviser' />
          </div>
          <p
            className={cn(
              'text-center',
              role === 'ADVISER' ? 'text-primary' : 'text-muted-foreground/80',
            )}>
            Adviser
          </p>
        </div>
      </div>
      <Button
        className='mt-4'
        disabled={!role || isLoading}
        onClick={() => setUserRole({ role: role! })}>
        {isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Submit'}
      </Button>
    </div>
  );
}
