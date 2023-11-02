import { db } from '@/db';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { notFound, redirect } from 'next/navigation';
import PDFRenderer from '../(components)/pdf-renderer';
import Comments from '../(components)/comments';

export default async function Document({
  params,
}: {
  params: { documentId: string };
}) {
  const { documentId } = params;

  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user || !user.id) return redirect('/auth-callback?origin=dashboard');

  const document = await db.document.findFirst({ where: { id: documentId } });

  const dbUser = await db.user.findFirst({ where: { id: user.id } });

  if (!dbUser || !dbUser.id || !dbUser.role)
    return redirect('/auth-callback?origin=dashboard');

  if (!document) notFound();

  return (
    <div className='flex h-full'>
      <div className='flex-1 justify-between flex'>
        <div className='mx-auto w-full max-w-8xl grow lg:flex xl:px-2'>
          <div className='flex-1 xl:flex'>
            <div className='px-4 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6'>
              <PDFRenderer url={document.url} />
            </div>
          </div>

          <div className='shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0'>
            <Comments
              documentId={document.id}
              userRole={dbUser.role}
              status={document.status}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
