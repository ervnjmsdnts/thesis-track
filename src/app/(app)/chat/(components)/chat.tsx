'use client';

import { trpc } from '@/app/_trpc/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { pusherClient } from '@/lib/pusher';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Chat, User } from '@prisma/client';
import { SendHorizonal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

function Message({
  userId,
  authorId,
  content,
  firstName,
  lastName,
}: {
  userId: string;
  authorId: string;
  content: string;
  firstName: string;
  lastName: string;
}) {
  const isAuthor = userId === authorId;

  return (
    <div
      className={cn('flex gap-2', !isAuthor ? 'justify-start' : 'justify-end')}>
      {!isAuthor ? (
        <div>
          <Avatar>
            <AvatarFallback>
              {firstName[0]}
              {lastName[0]}
            </AvatarFallback>
          </Avatar>
        </div>
      ) : null}
      <div
        className={cn(
          'p-2 max-w-md rounded-br-md rounded-bl-md',
          !isAuthor
            ? 'bg-secondary rounded-tr-md rounded-br-md'
            : 'bg-primary rounded-tl-md text-white',
        )}>
        {content}
      </div>
      {isAuthor ? (
        <div>
          <Avatar>
            <AvatarFallback>
              {firstName[0]}
              {lastName[0]}
            </AvatarFallback>
          </Avatar>
        </div>
      ) : null}
    </div>
  );
}

const schema = z.object({ content: z.string() });
type Schema = z.infer<typeof schema>;

export default function Chat({
  userId,
  groupId,
}: {
  userId: string;
  groupId: string;
}) {
  const form = useForm<Schema>({ resolver: zodResolver(schema) });

  const { data: chats, isLoading } = trpc.chat.getChats.useQuery({ groupId });
  const { mutate: createMessage, isLoading: createLoading } =
    trpc.chat.createMessage.useMutation({
      onSuccess: () => {
        form.reset({ content: '' });
      },
    });

  const [messages, setMessages] = useState<(Chat & { author: User })[] | []>(
    [],
  );

  useEffect(() => {
    pusherClient.subscribe(`chat_${groupId}`);

    pusherClient.bind('newMessage', (data: Chat & { author: User }) => {
      console.log('data');
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      pusherClient.unsubscribe(`chat_${groupId}`);
      pusherClient.unbind(`chat_${groupId}`);
    };
  }, [groupId]);

  useEffect(() => {
    if (!isLoading && chats) {
      setMessages(
        chats.map((chat) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          author: {
            ...chat.author,
            createdAt: new Date(chat.author.createdAt),
            updatedAt: new Date(chat.author.updatedAt),
          },
        })),
      );
    }
  }, [chats, isLoading]);

  const submit = (data: Schema) => {
    createMessage({ content: data.content, groupId });
  };

  return (
    <div className='flex flex-col gap-2 h-full'>
      <div className='border p-4 rounded-lg flex-1 flex flex-col'>
        {messages && messages.length > 0 ? (
          <div className='flex flex-grow h-0 overflow-y-auto flex-col gap-3'>
            {messages.map((chat) => (
              <Message
                key={chat.id}
                userId={userId}
                authorId={chat.authorId}
                firstName={chat.author.firstName}
                lastName={chat.author.lastName}
                content={chat.content}
              />
            ))}
          </div>
        ) : isLoading ? (
          <div>Loading</div>
        ) : (
          <div>No content</div>
        )}
      </div>
      <div className='flex items-center gap-2'>
        <Input
          {...form.register('content')}
          placeholder='Type your message here...'
          disabled={createLoading}
          onKeyDown={(e) => e.key === 'Enter' && form.handleSubmit(submit)()}
        />
        <Button onClick={form.handleSubmit(submit)} disabled={createLoading}>
          <SendHorizonal className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
