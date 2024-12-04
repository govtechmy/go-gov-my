import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { LinkProps } from '@/lib/types';
import { ProBadgeTooltip } from '@/ui/shared/pro-badge-tooltip';
import { Button, SimpleTooltipContent, Switch } from '@dub/ui';
import { COUNTRIES, FADE_IN_ANIMATION_SETTINGS } from '@dub/utils';
import { motion } from 'framer-motion';
import { Trash } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { shortenFilename, parseFileSize } from '@/lib/utils';

export default function UploadDocuments({
  props,
  data,
  setData,
}: {
  props?: LinkProps;
  data: LinkProps;
  setData: Dispatch<SetStateAction<LinkProps>>;
}) {
  const { messages, locale } = useIntlClientHook();
  const [filesSelected, setFilesSelected] = useState<FileList | null>(null);
  const fileUploadRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (fileUploadRef.current) {
      setFilesSelected(fileUploadRef.current.files);
    }
  }, [fileUploadRef.current]);

  const onFileSelected = (e) => {
    if (fileUploadRef.current) {
      setFilesSelected(e.target.files);
    }
  };

  const removeFileUpload = (fileIndex: number) => {
    if (!fileUploadRef.current || !filesSelected) return;

    const filesArray = Array.from(filesSelected);
    const updatedFiles = filesArray.filter((_, index) => index !== fileIndex);

    const dataTransfer = new DataTransfer();
    updatedFiles.forEach((file) => dataTransfer.items.add(file));

    fileUploadRef.current.files = dataTransfer.files;

    setFilesSelected(dataTransfer.files);
  };

  return (
    <div className="relative border-b border-gray-200 pb-5">
      <div className="flex flex-col p-2 bg-white rounded border-[1px] border-gray-200">
        <div className="flex items-center justify-between p-2">
          <div className="flex flex-col items-left justify-between">
            <div className="text-sm">Upload Documents</div>
            <div className="text-gray-500 text-xs">File types: JPG, PNG & PDF</div>
            <div className="text-gray-500 text-xs">Max file size: 25MB</div>
          </div>
          <input
            type="file"
            className="hidden"
            multiple
            accept="image/*,application/pdf"
            ref={fileUploadRef}
            onChange={onFileSelected}
          />
          <button
            className="flex gap-1 rounded border-[1px] border-grat-200 bg-white p-2 drop-shadow-sm"
            onClick={() => {
              fileUploadRef.current?.click();
            }}
          >
            <Upload />
            Upload
          </button>
        </div>
        <div>
          <div className="my-2">
            {filesSelected &&
              filesSelected.length > 0 &&
              Object.values(filesSelected).map((file: File, index: number) => {
                return (
                  <FileUI
                    key={file.name}
                    file={file}
                    removeFileUpload={removeFileUpload}
                    index={index}
                  />
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

const FileUI = ({ file, removeFileUpload, index }) => {
  return (
    <div className="flex items-center justify-between p-2 bg-white rounded border-[1px] border-gray-200 my-2">
      <div className="flex items-left justify-between gap-2 items-center">
        <div className="">
          <img src="/pdf-file.png" />
        </div>
        <div className="flex flex-col">
          <div className="text text-sm">{shortenFilename(file.name)}</div>
          <div className="text-gray-500 text-xs">{parseFileSize(file.size)}</div>
        </div>
      </div>
      <div
        className="cursor-pointer flex gap-1 text-red-500 bg-white p-2"
        onClick={() => removeFileUpload(index)}
      >
        <X />
      </div>
    </div>
  );
};
