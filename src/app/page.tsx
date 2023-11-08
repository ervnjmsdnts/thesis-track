import { Button } from '@/components/ui/button';
import { LoginLink, RegisterLink } from '@kinde-oss/kinde-auth-nextjs/server';
import Image from 'next/image';

export default function Home() {
  return (
    <div className='flex flex-col min-h-screen bg-white dark:bg-gray-800'>
      <header className='w-full px-8 py-4 bg-white border-b dark:bg-gray-800 dark:border-gray-700'>
        <div className='container mx-auto flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='relative h-12 w-12'>
              <Image fill src='/cics-logo.png' alt='CICS' />
            </div>
            <div className='text-2xl font-bold text-gray-800 dark:text-white'>
              ThesisTrack
            </div>
          </div>
          <nav className='space-x-4'>
            <Button variant='outline' asChild>
              <LoginLink>Login</LoginLink>
            </Button>
            <Button variant='default' asChild>
              <RegisterLink>Sign Up</RegisterLink>
            </Button>
          </nav>
        </div>
      </header>
      <main className='flex-grow'>
        <section className='container mx-auto px-8 py-16 space-y-8'>
          <h1 className='text-5xl font-bold text-center text-gray-800 dark:text-white'>
            Welcome to ThesisTrack
          </h1>
          <p className='text-xl text-center text-gray-600 dark:text-gray-300'>
            Manage your thesis projects with ease and efficiency.
          </p>
          <p className='text-lg text-center text-gray-500 dark:text-gray-400'>
            From planning to completion, we provide the tools you need to
            succeed in your academic journey.
          </p>
          <div className='flex justify-center'>
            <Button className='px-6 py-3' variant='default' asChild>
              <RegisterLink>Get Started</RegisterLink>
            </Button>
          </div>
        </section>
        <section className='bg-gray-100 dark:bg-gray-900 py-16'>
          <div className='container mx-auto px-8 space-y-12'>
            <h2 className='text-4xl font-bold text-center text-gray-800 dark:text-white'>
              Features
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              <div className='flex flex-col items-center space-y-4'>
                <svg
                  className=' w-16 h-16 text-primary'
                  fill='none'
                  height='24'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  viewBox='0 0 24 24'
                  width='24'
                  xmlns='http://www.w3.org/2000/svg'>
                  <path d='M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z' />
                  <polyline points='14 2 14 8 20 8' />
                </svg>
                <h3 className='text-2xl font-bold text-gray-800 dark:text-white'>
                  Manage Theses
                </h3>
                <p className='text-gray-600 dark:text-gray-400'>
                  Easily manage all your theses in one place.
                </p>
              </div>
              <div className='flex flex-col items-center space-y-4'>
                <svg
                  className=' w-16 h-16 text-primary'
                  fill='none'
                  height='24'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  viewBox='0 0 24 24'
                  width='24'
                  xmlns='http://www.w3.org/2000/svg'>
                  <path d='M3 7V5c0-1.1.9-2 2-2h2' />
                  <path d='M17 3h2c1.1 0 2 .9 2 2v2' />
                  <path d='M21 17v2c0 1.1-.9 2-2 2h-2' />
                  <path d='M7 21H5c-1.1 0-2-.9-2-2v-2' />
                  <rect height='5' rx='1' width='7' x='7' y='7' />
                  <rect height='5' rx='1' width='7' x='10' y='12' />
                </svg>
                <h3 className='text-2xl font-bold text-gray-800 dark:text-white'>
                  Collaborate
                </h3>
                <p className='text-gray-600 dark:text-gray-400'>
                  Work together with your team seamlessly.
                </p>
              </div>
              <div className='flex flex-col items-center space-y-4'>
                <svg
                  className=' w-16 h-16 text-primary'
                  fill='none'
                  height='24'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  viewBox='0 0 24 24'
                  width='24'
                  xmlns='http://www.w3.org/2000/svg'>
                  <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14' />
                  <polyline points='22 4 12 14.01 9 11.01' />
                </svg>
                <h3 className='text-2xl font-bold text-gray-800 dark:text-white'>
                  Approval System
                </h3>
                <p className='text-gray-600 dark:text-gray-400'>
                  Get your thesis approved swiftly with our efficient approval
                  system.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className='w-full py-6 bg-gray-800'>
        <div className='container mx-auto px-8 text-center text-white'>
          <p>© 2023 ThesisTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
