// apps/web/components/LandingPage.js
import Image from "next/image";
import IdentifyWebsite from "../header/identify-website";
import GoGovAnim from "./rive-animation";

const RedirectComponent = () => {
  //   return (
  //     <>
  //       <div className="flex h-full w-full flex-col items-start justify-start bg-white">
  //         <div className="flex h-7 flex-col items-center justify-start gap-3 self-stretch bg-zinc-100 px-6">
  //           <div className="flex items-center justify-start gap-1.5 self-stretch py-1">
  //             <div className="relative h-5 w-5" />
  //             <div className="text-sm font-normal leading-none text-zinc-700">
  //               An official Malaysian Government Website
  //             </div>
  //             <div className="flex items-center justify-start gap-0.5">
  //               <div className="text-sm font-normal leading-none text-blue-600">
  //                 Here&apos;s how you know
  //               </div>
  //               <div className="relative h-4 w-4" />
  //             </div>
  //           </div>
  //         </div>
  //         <div className="flex flex-grow items-center justify-center gap-6 self-stretch">
  //           <div className="flex w-full flex-col items-center justify-start self-stretch px-6">
  //             <div className="flex flex-grow flex-col items-center justify-center gap-10 self-stretch py-16">
  //               <div className="flex h-[86px] flex-col items-center justify-start gap-4">
  //                 <div className="self-stretch text-center text-3xl font-semibold text-zinc-900">
  //                   Verify your address bar
  //                 </div>
  //                 <div className="flex items-center justify-center gap-1.5 self-stretch">
  //                   <div className="text-base font-normal text-zinc-700">
  //                     Be cautious of phishing, make sure the URL begins with
  //                   </div>
  //                   <div className="flex w-[100px] items-center justify-start gap-[5px] rounded-full bg-blue-50 px-2.5 py-1">
  //                     <div className="text-base font-medium text-blue-600">
  //                       go.gov.my
  //                     </div>
  //                   </div>
  //                 </div>
  //               </div>
  //               <div className="flex h-[350px] w-[500px] items-center justify-center overflow-hidden rounded-[32px] border border-zinc-200 bg-neutral-50">
  //                 <GogovAnim></GogovAnim>
  //               </div>
  //               <div className="flex h-[76px] flex-col items-center justify-start gap-4">
  //                 <div className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 shadow">
  //                   <div className="text-base font-medium text-white">
  //                     I’ve check the link. Skip ahead
  //                   </div>
  //                   <div className="relative h-5 w-5" />
  //                 </div>
  //                 <div className="flex items-center justify-center gap-1">
  //                   <div className="text-sm font-normal text-zinc-700">
  //                     You’ll be redirected to in 10 seconds
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>
  //             <div className="flex h-[132px] flex-col items-center justify-start gap-6 self-stretch pb-16">
  //               <div className="flex items-center justify-center gap-4">
  //                 <div className="flex h-6 items-center justify-start gap-2.5">
  //                   <div className="flex h-6 w-[30.77px] items-center justify-center py-[0.48px] pl-[0.71px] pr-[0.66px]">
  //                     <img className="w-[29.40px]" src="/jata_logo.png" />
  //                   </div>
  //                   <div className="text-sm font-semibold text-zinc-900">
  //                     Government of Malaysia
  //                   </div>
  //                 </div>
  //                 <div className="flex items-center justify-start gap-[7.50px]">
  //                   {/* <div className="relative h-6 w-6 rounded-md bg-emerald-300" /> */}
  //                   <img className="w-[29.40px]" src="/favicon-32x32.png" />
  //                   <div className="text-sm font-semibold text-zinc-900">
  //                     go.gov.my
  //                   </div>
  //                 </div>
  //               </div>
  //               <div className="self-stretch text-center text-sm font-normal text-zinc-500">
  //                 You will only be shown this page the first time you access this
  //                 short link.
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </>
  //   );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex justify-center py-1">
        <IdentifyWebsite />
      </div>
      <div className="flex flex-grow flex-col items-center justify-center bg-white px-4 text-center">
        <h1 className="mb-10 text-3xl font-bold leading-none tracking-wide text-gray-900 dark:text-white md:text-2xl lg:text-4xl">
          Verify your address bar
        </h1>
        <p className="mb-10 text-gray-700">
          Be cautious of phishing, make sure the URL begins with{" "}
          <span className="mb-10 me-2 rounded-full bg-blue-50 px-2.5 py-1 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
            go.gov.my
          </span>
        </p>
        <div className="mb-5 flex h-[350px] w-[500px] items-center justify-center overflow-hidden rounded-[32px] border border-zinc-200 bg-neutral-50">
          <GoGovAnim></GoGovAnim>
        </div>
        <button
          type="button"
          className="dark:focus:ring-[#4285F4]/55 mb-5 me-2 inline-flex items-center rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-[#4285F4]/50"
        >
          I&apos;ve check the link. Skip ahead
          <span className="ml-4">
            <svg
              width="16"
              height="12"
              viewBox="0 0 16 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.75 0.75L15.25 6L9.75 11.25M15 6H0.75"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        </button>
        <p className="text-gray-700">
          You&apos;ll be redirected in <b>10 Seconds.</b>
        </p>
        <footer className="mt-20 w-full py-4 text-center text-gray-600">
          <div className="flex justify-center space-x-4">
            <Image
              src="/jata_logo.png"
              width={25}
              height={25}
              alt="Logo Jata Negara"
            />
            <a
              href="https://www.malaysia.gov.my/portal/"
              className="font-bold text-black"
              target="_blank"
            >
              Government of Malaysia
            </a>
            <span>|</span>
            <Image
              src="/_static/logo.png"
              width={25}
              height={25}
              alt="Logo Jata Negara"
            />
            <a
              href="https://go.gov.my/"
              target="_blank"
              className="font-bold text-black"
            >
              go.gov.my
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default RedirectComponent;
