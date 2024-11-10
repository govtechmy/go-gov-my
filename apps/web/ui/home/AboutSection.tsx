export default function AboutSection() {
  return (
    <>
      <section className="border-x-2 border-gray-100 bg-white dark:bg-gray-900 lg:mx-24">
        <div className="mx-auto max-w-screen-xl px-4 py-8 lg:py-16">
          <h1 className="mb-4 text-center text-xl font-semibold leading-none tracking-wide text-gray-900 dark:text-white md:text-xl lg:text-3xl">
            Created for Public Officers
          </h1>
          <p className="text-md lg:text-md text-center font-normal text-gray-500 dark:text-gray-400 sm:px-16 lg:px-48">
            with official email from{' '}
            <span className="mr-1 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-gray-900 dark:text-gray-300">
              @mohe
            </span>
            .gov.my
          </p>

          <div className="mx-auto max-w-screen-xl px-4 py-8 lg:py-16">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800 md:p-12">
                <h2 className="mb-2 text-3xl font-extrabold text-gray-900 dark:text-white">
                  Placeholder
                </h2>
                <span className="rounded-lg border border-gray-50 bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-gray-900 dark:text-gray-300">
                  CUSTOMIZED
                </span>
                <p className="text-md mt-2 text-left font-normal text-gray-800 dark:text-gray-400">
                  Share short links to save space and for easy recall
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800 md:p-12">
                <h2 className="mb-2 text-3xl font-extrabold text-gray-900 dark:text-white">
                  Placeholder
                </h2>
                <span className="rounded-lg border border-gray-50 bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-gray-900 dark:text-gray-300">
                  ANTI-PHISHING
                </span>
                <p className="text-md mt-2 text-left font-normal text-gray-800 dark:text-gray-400">
                  Use go.gov.my to shorten and secured government links
                </p>
              </div>
              <div className="ounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800 md:p-12">
                <h2 className="mb-2 text-3xl font-extrabold text-gray-900 dark:text-white">
                  Placeholder
                </h2>
                <span className="rounded-lg border border-gray-50 bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-gray-900 dark:text-gray-300">
                  SOCIAL-SHARING
                </span>
                <p className="text-md mt-2 text-left font-normal text-gray-800 dark:text-gray-400">
                  Upload your own image and share it on social platforms
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800 md:p-12">
                <h2 className="mb-2 text-3xl font-extrabold text-gray-900 dark:text-white">
                  Placeholder
                </h2>
                <span className="rounded-lg border border-gray-50 bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-gray-900 dark:text-gray-300">
                  ANALYTICS
                </span>
                <p className="text-md mt-2 text-left font-normal text-gray-800 dark:text-gray-400">
                  Track your link&apos;s click rate easily through dashboard
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
