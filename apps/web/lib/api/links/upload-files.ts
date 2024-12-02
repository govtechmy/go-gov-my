import { withSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { storage } from '@/lib/storage';
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

export default async function uploadFiles(formData: FormData) {
  let { projectId, userId, linkId, files } = await parseFormData(formData);
  // get user name from id
  const userName = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!userName) {
    throw new DubApiError({
      code: 'bad_request',
      message: 'User not found',
    });
  }

  const responses: any[] = [];
  for (let i = 0; i < files.length; i++) {
    try {
      const newFileName = `${uuidv4()}_${files[i].name}`;
      const { url } = await storage.upload(`FileUpload/${projectId}/${newFileName}`, files[i]);
      const fileUrl = url;

      await prisma.file.create({
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
