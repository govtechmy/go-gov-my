import { useIntlClientHook } from "@/lib/middleware/utils/useI18nClient";

export default function NoLinksPlaceholder({
  AddEditLinkButton,
}: {
  AddEditLinkButton: () => JSX.Element;
}) {
  const { messages } = useIntlClientHook();
  const message = messages?.link;
  return (
    <div className="mb-12 flex flex-col items-center justify-center rounded-md border border-gray-200 bg-white py-12">
      <h2 className="z-10 text-xl font-semibold text-gray-700">
        {message?.no_link}
      </h2>
      <img
        src="/_static/illustrations/cat-shot.svg"
        alt="No links yet"
        width={400}
        height={400}
        className="pointer-events-none -my-8"
      />
      <div>
        <AddEditLinkButton />
      </div>
      <p className="mt-2 text-sm text-gray-500">{message?.edit}</p>
    </div>
  );
}
