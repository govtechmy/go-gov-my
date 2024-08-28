import { GOAPP_PARAM_AUTH_URL } from "@/constants/goapp";
import { cn } from "@/lib/utils";
import SecureLinkFormContent from "./SecureLinkFormContent";

export default function SecureLinkForm() {
  return (
    <form
      method="GET"
      action={GOAPP_PARAM_AUTH_URL}
      className={cn(
        "mt-[2.25rem] md:mt-[2.5rem]",
        "flex flex-col items-center",
        "h-[2.5rem] w-[20.25rem] md:w-[25rem]",
        "px-[1.125rem] lg:px-0",
      )}
    >
     <SecureLinkFormContent />
    </form>
  );
}
