import { db } from '@/db';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: '16MB' } })
    .middleware(async () => {
      const { getUser } = getKindeServerSession();
      const user = getUser();

      if (!user || !user.id) throw new Error('Unauthorized');

      const currentGroup = await db.group.findFirst({
        where: { members: { some: { id: user.id } } },
      });

      if (!currentGroup || !currentGroup.id) throw new Error('Not Found');

      return { groupId: currentGroup.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const createDocument = await db.document.create({
        data: {
          key: file.key,
          file: file.name,
          groupId: metadata.groupId,
          url: file.url,
        },
      });
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
