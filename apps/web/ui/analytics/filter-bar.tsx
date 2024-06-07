import { ClientOnly } from "@dub/ui";
import TagSelector from "./tag-selector";

export default function FilterBar() {
  return (
    <ClientOnly>
      <div className="grid w-full grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1 min-[550px]:w-auto lg:flex">
        <TagSelector />
      </div>
    </ClientOnly>
  );
}
