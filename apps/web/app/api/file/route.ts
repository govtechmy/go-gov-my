import { withSession } from '@/lib/auth';
import { logRequestMetrics } from '@/lib/decorator/logRequestMetrics';
import { prisma } from '@/lib/prisma';
import { storage } from '@/lib/storage';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

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
  projectId: z.string().uuid({ message: 'Invalid projectId. Must be a valid UUID.' }),
  userId: z.string().uuid({ message: 'Invalid userId. Must be a valid UUID.' }),
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
  const files = formData.getAll('files');

  const parsedData = formDataSchema.safeParse({
    projectId,
    userId,
    files,
  });

  if (!parsedData.success) {
    throw new Error(JSON.stringify(parsedData.error.format(), null, 2));
  }

  return parsedData.data;
};

// POST /api/file upload a specific file
export const POST = logRequestMetrics(
  withSession(async ({ req, session }) => {
    const formData = await req.formData();
    let { projectId, userId, files } = await parseFormData(formData);
    try {
      // get user name from id
      const userName = await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
      });
      console.log(projectId, userId, files);
      const responses: any[] = [];
      for (let i = 0; i < files.length; i++) {
        const newFileName = `${uuidv4()}_${files[i].name}`;
        const { url } = await storage.upload(`FileUpload/${projectId}/${newFileName}`, files[i]);

        const writeToDbSuccess = await prisma.file.create({
          data: {
            ...(projectId && { projectId }),
            ...(userId && { userId }),
            ...(url && { url }),
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
