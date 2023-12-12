'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { trpc } from '@/app/_trpc/client';
import SelectMultipleMembers from '@/components/select-multiple-members';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const schema = z.object({
  title: z.string().min(1),
});

type Schema = z.infer<typeof schema>;

export default function CreateGroup({
  joinGroup,
  groupTitles,
}: {
  joinGroup: () => void;
  groupTitles: (string | null)[];
}) {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const form = useForm<Schema>({ resolver: zodResolver(schema) });

  const router = useRouter();
  const { toast } = useToast();

  const { mutate: createGroupByStudent, isLoading } =
    trpc.group.createGroupByStudent.useMutation({
      onSuccess: (data) => {
        if (Array.isArray(data)) {
          const studentNames = data;
          if (studentNames.length > 2) {
            toast({
              title: 'Invites Sent',
              description: `Emails have been sent to ${studentNames.length} students.`,
            });
          } else if (studentNames.length === 2) {
            toast({
              title: 'Invites Sent',
              description: `Emails have been sent to ${studentNames[0]} and ${studentNames[1]}.`,
            });
          } else if (studentNames.length === 1) {
            toast({
              title: 'Invite Sent',
              description: `An email has been sent to ${studentNames[0]}`,
            });
          }
          router.replace('/s/dashboard');
        } else {
          router.replace('/s/dashboard');
        }
      },
    });

  const submit = async (data: Schema) => {
    const isGroupTitleExist = groupTitles.some((title) => title === data.title);
    if (isGroupTitleExist) {
      return toast({
        title: 'Existing',
        description: 'The title you entered already exists',
        variant: 'destructive',
      });
    }
    return createGroupByStudent({ title: data.title, members: selectedUsers });
  };
  return (
    <div className='flex justify-center items-center h-full w-full'>
      <Card className='w-[600px]'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Create group</CardTitle>
            <Button variant='link' onClick={joinGroup}>
              Join a group
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid gap-2'>
            <div>
              <Label>Thesis Title</Label>
              <div>
                <Input
                  placeholder='Name of your thesis'
                  className={cn(
                    form.formState.errors.title &&
                      'focus-visible:ring-red-400 border-red-400',
                  )}
                  {...form.register('title')}
                />
              </div>
            </div>
            <SelectMultipleMembers
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
            />
          </div>
        </CardContent>
        <CardFooter className='flex justify-end'>
          <Button onClick={form.handleSubmit(submit)} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              'Create Group'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
