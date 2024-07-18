// apps/web/components/LandingPage.js

import Image from "next/image";
import IdentifyWebsite from "../header/identify-website";

const ServerErrorComponent = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex justify-center py-1">
        <IdentifyWebsite />
      </div>
      <div className="flex flex-grow flex-col items-center justify-center bg-white px-4 text-center">
        <span className="mb-10 me-2 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900 dark:text-red-300">
          500 ERROR
        </span>
        <h1 className="mb-10 text-3xl font-bold leading-none tracking-wide text-gray-900 dark:text-white md:text-2xl lg:text-4xl">
          Something went wrong
        </h1>
        <p className="mb-10 text-gray-700">
          For more help, please reach out to the agency <br /> that provided you
          with this short link.
        </p>
        <p className="text-gray-700">
          You&apos;ll be redirected to the home page in <b>10 Seconds.</b>
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

export default ServerErrorComponent;
