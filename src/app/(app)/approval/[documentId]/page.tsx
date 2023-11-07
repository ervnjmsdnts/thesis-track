import { db } from '@/db';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { notFound, redirect } from 'next/navigation';
import PDFRenderer from '../(components)/pdf-renderer';
import Comments from '../(components)/comments';
import DocumentView from '../(components)/document-view';

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
        <div className='w-full grow grid grid-cols-6 h-full'>
          <DocumentView
            url={document.url}
            documentId={document.id}
            userRole={dbUser.role}
            status={document.status}
          />
        </div>
      </div>
    </div>
  );
}
