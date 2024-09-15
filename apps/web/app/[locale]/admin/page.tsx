import { useIntlHook } from "@/lib/middleware/utils/useI18n";
import { constructMetadata } from "@dub/utils";
import LinkManagement from "./components/link-management";
import MemberLists from "./components/member-lists";

export async function generateMetadata({ params }) {
  const { locale } = params;
  return constructMetadata({
    locale,
    title: `${process.env.NEXT_PUBLIC_APP_NAME} - Admin Portal`,
    noIndex: true,
  });
}

export default function AdminPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const { messages } = useIntlHook(locale);
  return (
    <div className="mx-auto flex w-full max-w-screen-lg flex-col divide-y divide-gray-200 overflow-auto bg-white">
      <div className="flex flex-col space-y-4 px-5 py-10">
        <h2 className="text-xl font-semibold">Analytics</h2>
        <p className="text-sm text-gray-500">Lorem Ipsum Dolor Sit Amet</p>
        {/* <LinkManagement /> */}
      </div>

      <div className="flex flex-col space-y-4 px-5 py-10">
        <h2 className="text-xl font-semibold">
          {messages?.admin?.user_management?.user_management_title}
        </h2>
        <p className="text-sm text-gray-500">
          {messages?.admin?.user_management?.user_management_description}
        </p>
        <MemberLists />
      </div>

      <div className="flex flex-col space-y-4 px-5 py-10">
        <h2 className="text-xl font-semibold">
          {messages?.admin?.workspace_management?.workspace_management_title}
        </h2>
        <p className="text-sm text-gray-500">
          {
            messages?.admin?.workspace_management
              ?.workspace_management_description
          }
        </p>
        <LinkManagement />
      </div>

      {/* <div className="flex flex-col space-y-4 px-5 py-10">
        <h2 className="text-xl font-semibold">Email Domain Management</h2>
        <p className="text-sm text-gray-500">
          Lorem Ipsum Dolor Sit Amet (Include CSV Here)
        </p>
        <LinkManagement />
      </div> */}
    </div>
  );
}
