import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import * as React from 'react';

const baseUrl = process.env.VERCEL_URL
  ? `https://thesis-track.vercel.app`
  : 'http://localhost:3000';

export default function InviteEmail({
  title,
  userName,
  userId,
  groupId,
  senderName,
  senderEmail,
}: {
  title: string;
  userName: string;
  userId: string;
  groupId: string;
  senderName: string;
  senderEmail: string;
}) {
  const previewText = `Join ${title}`;

  const inviteLink = `${baseUrl}/invite/${userId}/${groupId}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className='bg-white my-auto mx-auto font-sans'>
          <Container className='border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]'>
            <Section className='mt-[32px]'>
              <Text className='text-center text-blue-500 font-bold text-xl'>
                ThesisTrack
              </Text>
            </Section>
            <Heading className='text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0'>
              Join <strong>{title}</strong>
            </Heading>
            <Text className='text-black text-[14px] leading-[24px]'>
              Hello {userName},
            </Text>
            <Text className='text-black text-[14px] leading-[24px]'>
              <strong>{senderName}</strong> (
              <Link
                href={`mailto:${senderEmail}`}
                className='text-blue-600 no-underline'>
                {senderEmail}
              </Link>
              ) has invited you to the <strong>{title}</strong> group.
            </Text>
            <Section className='text-center mt-[32px] mb-[32px]'>
              <Button
                pX={20}
                pY={12}
                className='bg-blue-500 rounded text-white text-[12px] font-semibold no-underline text-center'
                href={inviteLink}>
                Join the group
              </Button>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
