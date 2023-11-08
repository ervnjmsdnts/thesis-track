'use client';

import { useState } from 'react';
import CreateGroup from './create-group';
import JoinGroup from './join-group';

export default function AssignGroup({
  groupTitles,
}: {
  groupTitles: (string | null)[];
}) {
  const [isCreate, setIsCreate] = useState(true);

  const joinGroup = () => setIsCreate(false);
  const createGroup = () => setIsCreate(true);

  return (
    <div className='h-full'>
      {isCreate ? (
        <CreateGroup groupTitles={groupTitles} joinGroup={joinGroup} />
      ) : (
        <JoinGroup createGroup={createGroup} />
      )}
    </div>
  );
}
