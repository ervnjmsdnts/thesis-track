'use client';

import { trpc } from '@/app/_trpc/client';
import Message from '@/components/message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { pusherClient } from '@/lib/pusher';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Chat, User } from '@prisma/client';
import { Ghost, Loader2, SendHorizonal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({ content: z.string().min(1) });
type Schema = z.infer<typeof schema>;

export default function StudentChat({
  userId,
  groupId,
}: {
  userId: string;
  groupId: string;
}) {
  const form = useForm<Schema>({ resolver: zodResolver(schema) });

  const scrollRef = useRef<HTMLInputElement>(null);

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
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      pusherClient.unsubscribe(`chat_${groupId}`);
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

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const submit = (data: Schema) => {
    createMessage({ content: data.content, groupId });
  };

  return (
    <div className='flex flex-col gap-2 h-full'>
      <div className='border p-4 bg-white rounded-lg flex-1 flex flex-col'>
        {messages && messages.length > 0 ? (
          <div className='flex flex-grow h-0 overflow-y-auto flex-col gap-3'>
            {messages.map((chat) => (
              <Message
                key={chat.id}
                userId={userId}
                picture={chat.author.picture}
                authorId={chat.authorId}
                firstName={chat.author.firstName}
                lastName={chat.author.lastName}
                content={chat.content}
              />
            ))}
            <div ref={scrollRef}></div>
          </div>
        ) : isLoading ? (
          <div className='flex w-full justify-center mt-16'>
            <Loader2 className='h-8 w-8 animate-spin' />
          </div>
        ) : (
          <div className='flex flex-col w-full items-center gap-2 mt-16'>
            <Ghost className='h-8 w-8 text-zinc-800' />
            <h3 className='font-semibold text-xl'>No Chats</h3>
          </div>
        )}
      </div>
      <div className='flex items-center gap-2'>
        <Input
          {...form.register('content')}
          className={cn(
            form.formState.errors.content && 'focus-visible:ring-red-400',
          )}
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
