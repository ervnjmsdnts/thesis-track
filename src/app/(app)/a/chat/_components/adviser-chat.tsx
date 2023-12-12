'use client';

import { trpc } from '@/app/_trpc/client';
import GroupFilter from '@/components/group-filter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Chat, User } from '@prisma/client';
import { Ghost, Loader2, SendHorizonal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { pusherClient } from '@/lib/pusher';
import Message from '@/components/message';

const schema = z.object({ content: z.string().min(1) });
type Schema = z.infer<typeof schema>;

export default function AdviserChat({ userId }: { userId: string }) {
  const { data: groups, isLoading: groupLoading } =
    trpc.group.getAll.useQuery();

  const [selectedGroup, setSelectedGroup] = useState<string>();

  const form = useForm<Schema>({ resolver: zodResolver(schema) });

  const scrollRef = useRef<HTMLInputElement>(null);

  const { data: chats, isLoading: chatLoading } = trpc.chat.getChats.useQuery(
    {
      groupId: selectedGroup!,
    },
    { enabled: !!selectedGroup },
  );
  const { mutate: createMessage, isLoading: createLoading } =
    trpc.chat.createMessage.useMutation({
      onSuccess: () => {
        form.reset({ content: '' });
      },
    });

  const filteredGroup = groups?.filter((group) =>
    group.members.some((m) => m.id === userId),
  );

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const submit = (data: Schema) => {
    createMessage({ content: data.content, groupId: selectedGroup! });
  };

  const [messages, setMessages] = useState<(Chat & { author: User })[] | []>(
    [],
  );

  useEffect(() => {
    pusherClient.subscribe(`chat_${selectedGroup!}`);

    pusherClient.bind('newMessage', (data: Chat & { author: User }) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      pusherClient.unsubscribe(`chat_${selectedGroup!}`);
    };
  }, [selectedGroup]);

  useEffect(() => {
    if (!chatLoading && chats && selectedGroup) {
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
  }, [chats, chatLoading, selectedGroup]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className='flex h-full w-full'>
      <GroupFilter
        isLoading={groupLoading}
        filteredGroup={filteredGroup?.map((g) => ({
          ...g,
          createdAt: new Date(g.createdAt),
          updatedAt: new Date(g.updatedAt),
        }))}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
      />
      {groups && groups.length > 0 && selectedGroup ? (
        <div className='flex flex-col gap-2 pl-4 h-full w-full'>
          <div className='flex-1 border rounded-lg p-4 w-full bg-white flex flex-col'>
            {messages && messages.length > 0 ? (
              <div className='flex flex-grow h-0 overflow-y-auto flex-col gap-3'>
                {messages.map((chat) => (
                  <Message
                    key={chat.id}
                    userId={userId}
                    authorId={chat.authorId}
                    firstName={chat.author.firstName}
                    lastName={chat.author.lastName}
                    picture={chat.author.picture}
                    content={chat.content}
                  />
                ))}
                <div ref={scrollRef}></div>
              </div>
            ) : chatLoading ? (
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
              placeholder='Type your message here...'
              {...form.register('content')}
              className={cn(
                form.formState.errors.content && 'focus-visible:ring-red-400',
              )}
              disabled={createLoading}
              onKeyDown={(e) =>
                e.key === 'Enter' && form.handleSubmit(submit)()
              }
            />
            <Button
              onClick={form.handleSubmit(submit)}
              disabled={createLoading}>
              <SendHorizonal className='h-4 w-4' />
            </Button>
          </div>
        </div>
      ) : groupLoading ? (
        <div className='flex justify-center w-full mt-16'>
          <Loader2 className='h-8 w-8 animate-spin' />
        </div>
      ) : (
        <div className='flex flex-col w-full items-center gap-2 mt-16'>
          <Ghost className='h-8 w-8 text-zinc-800' />
          <h3 className='font-semibold text-xl'>No Selected Group</h3>
        </div>
      )}
    </div>
  );
}
