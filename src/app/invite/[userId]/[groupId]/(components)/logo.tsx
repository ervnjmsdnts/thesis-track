'use client';

import Image from 'next/image';

export default function Logo() {
  return (
    <div className='relative h-20 w-20'>
      <Image fill src='/cics-logo.png' alt='CICS' />
    </div>
  );
}
