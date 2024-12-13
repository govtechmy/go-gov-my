import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const shortenFilename = (filename: string) => {
  if (typeof filename != 'string') return filename;
  if (filename.length < 12) return filename;
  return `${filename.substring(0, 12)}...`;
};

export const parseFileSize = (bytes: number) => {
  if (bytes >= 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  } else if (bytes >= 1024) {
    return (bytes / 1024).toFixed(2) + ' KB';
  } else {
    return bytes + ' bytes';
  }
};
