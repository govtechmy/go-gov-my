"use client";

import { cn } from "@/lib/utils";
import Rive from "@rive-app/react-canvas";
import { Download, X } from 'lucide-react';
import { useState, useEffect } from "react";
import { shortenFilename } from "@/utils/helper";

type Props = {
  files: string;
};

export default function UploadDocuments({ files }: Props) {

  const [filesArr, setFilesArr] = useState<string[]>([]);

  useEffect(()=>{
    setFilesArr(files.split(","))
  }, [files])

  return (
    <div className="relative border-b border-gray-200 pb-5">
      <div className="flex flex-col p-2 bg-white rounded border-[1px] border-gray-200">
        <div className="flex items-center justify-between p-2 gap-8">
          <div className="flex flex-col items-left justify-between">
            <div className="text-sm">Documents</div>
            <div className="text-gray-500 text-xs">5 Files . 10.87 MB</div>
          </div>
          <button
            className="flex gap-1 rounded border-[1px] border-grat-200 bg-blue-600 text-[#fff] p-2 drop-shadow-sm"
          >
            <Download />
            Download All
          </button>
        </div>
        <div>
          <div className="my-2">
            {filesArr &&
              filesArr.length > 0 &&
              Object.values(files).map((file: string, index: number) => {
                return (
                  <FileUI
                    key={file}
                    file={file}
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

const FileUI = ({ file, index }: { file: string, index: number }) => {
  return (
    <div className="flex items-center justify-between p-2 bg-white rounded border-[1px] border-gray-200 my-2">
      <div className="flex items-left justify-between gap-2 items-center">
        <div className="">
          <img src="/pdf-file.png" />
        </div>
        <div className="flex flex-col">
          <div className="text text-sm">{shortenFilename(file)}</div>
          {/* <div className="text-gray-500 text-xs">{parseFileSize(file.size)}</div> */}
        </div>
      </div>
      <div
        className="cursor-pointer flex gap-1 text-red-500 bg-white p-2"
      >
        <Download />
      </div>
    </div>
  );
};
