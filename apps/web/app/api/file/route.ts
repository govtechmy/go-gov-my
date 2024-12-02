import { withSession } from '@/lib/auth';
import { logRequestMetrics } from '@/lib/decorator/logRequestMetrics';
import { prisma } from '@/lib/prisma';
import { storage } from '@/lib/storage';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { DubApiError, ErrorCodes } from '@/lib/api/errors';

// PDF, .PNG, .JPEG, DOCX, XLSX, CSV, PPTX
const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'docx', 'xlsx', 'csv', 'pptx'];
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

const isFileValid = (file: File) => {
  const fileSizeLimit = 5 * 1024 * 1024; // 5MB in bytes
  const mimeTypeValid = allowedMimeTypes.includes(file.type);
  const extensionValid = allowedExtensions.some((ext) => file.name.endsWith(`.${ext}`));
  return mimeTypeValid && extensionValid && file.size <= fileSizeLimit;
};

const formDataSchema = z.object({
  projectId: z.string().uuid({ message: 'Invalid project Id. Must be a valid UUID.' }),
  userId: z.string().uuid({ message: 'Invalid user Id. Must be a valid UUID.' }),
  linkId: z.string().uuid({ message: 'Invalid link Id. Must be a valid UUID.' }),
  files: z
    .array(
      z.instanceof(File).refine((file) => isFileValid(file), {
        message: 'File must be below 5MB and have a valid MIME type and extension.',
      })
    )
    .nonempty({ message: 'At least one file must be uploaded.' }),
});

const parseFormData = async (formData: FormData) => {
  const projectId = formData.get('projectId');
  const userId = formData.get('userId');
  const linkId = formData.get('linkId');
  const files = formData.getAll('files');

  const parsedData = formDataSchema.safeParse({
    projectId,
    userId,
    linkId,
    files,
  });

  if (!parsedData.success) {
    throw new DubApiError({
      code: 'bad_request',
      message: JSON.stringify(parsedData.error.format(), null, 2),
    });
  }

  return parsedData.data;
};

// POST /api/file upload a specific file
export const POST = logRequestMetrics(
  withSession(async ({ req, session }) => {
    const formData = await req.formData();
    let { projectId, userId, linkId, files } = await parseFormData(formData);
    try {
      // get user name from id
      const userName = await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
      });

      const responses: any[] = [];
      for (let i = 0; i < files.length; i++) {
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
          file: url,
          success: writeToDbSuccess,
        });
      }

      return NextResponse.json(responses);
    } catch (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
  })
);
