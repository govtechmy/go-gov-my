import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { MaxWidthWrapper } from '@dub/ui';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useAddWorkspaceModal } from '../modals/add-workspace-modal';

export default function WorkspaceNotFound() {
  const { messages, locale } = useIntlClientHook();
  const { setShowAddWorkspaceModal, AddWorkspaceModal } = useAddWorkspaceModal();

  const searchParams = useSearchParams();

  useEffect(() => {
    setShowAddWorkspaceModal(false);
  }, [searchParams, setShowAddWorkspaceModal]);

  const message = messages?.workspace;
  return (
    <MaxWidthWrapper>
      <div className="my-10 flex flex-col items-center justify-center rounded-md border border-gray-200 bg-white py-12">
        {/* <div className="rounded-full bg-gray-100 p-3"> */}
        {/* <FileX2 className="h-6 w-6 text-gray-600" /> */}
        {/* </div> */}
        <h1 className="my-3 text-xl font-semibold text-gray-700">{message?.no_workspace}</h1>
        <p className="z-10 max-w-sm text-center text-sm text-gray-600">
          {message?.not_workspace_desc}
        </p>
        <img
          src="/_static/illustrations/coffee-call.svg"
          alt="No links yet"
          width={400}
          height={400}
        />
        <AddWorkspaceModal />
        <button
          onClick={() => setShowAddWorkspaceModal(true)}
          className="z-10 rounded-md border border-black bg-black px-10 py-2 text-sm font-medium text-white transition-all duration-75 hover:bg-white hover:text-black"
        >
          {message?.create_title}
        </button>
      </div>
    </MaxWidthWrapper>
  );
}
