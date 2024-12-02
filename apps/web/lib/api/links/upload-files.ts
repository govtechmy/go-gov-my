import { prisma } from '@/lib/prisma';
import { storage } from '@/lib/storage';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { DubApiError, ErrorCodes } from '@/lib/api/errors';

export default async function uploadFiles({
  projectId,
  userId,
  linkId,
  files,
}: {
  projectId: string;
  userId: string;
  linkId: string;
  files: File[];
}): Promise<Array<{ file: string; success: boolean }>> {
  const responses: any[] = [];

  // get user name from id
  const userName = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!userName) {
    throw new DubApiError({
      code: 'bad_request',
      message: 'userId does not exists',
    });
  }

  for (let i = 0; i < files.length; i++) {
    try {
      const newFileName = `${uuidv4()}_${files[i].name}`;
      const { url } = await storage.upload(`FileUpload/${projectId}/${newFileName}`, files[i]);
      const fileUrl = url;

      const writeToDbSuccess = await prisma.file.create({
        data: {
          ...(projectId && { projectId }),
          ...(userId && { userId }),
          ...(fileUrl && { fileUrl }),
          ...(linkId && { linkId }),
          status: 'Uploading',
          createdBy: userName.name,
        },
      });

      responses.push({
        file: files[i].name,
        success: true,
      });
    } catch (error) {
      responses.push({
        file: files[i].name,
        success: false,
      });
    }
  }

  return responses;
}
