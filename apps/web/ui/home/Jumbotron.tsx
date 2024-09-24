export default function Jumbotron() {
  return (
    <>
      <section className="border-x-2 border-gray-100 bg-white dark:bg-gray-900 lg:mx-24">
        <div className="mx-auto px-4 py-8 lg:py-16">
          <div className="mx-12 grid gap-8 md:grid-cols-2">
            <div className="">
              <h2 className="mb-10 mt-12 text-4xl font-semibold text-gray-900 dark:text-white">
                Trusted Official Links for Malaysians
              </h2>
              <p className="mb-4 text-lg font-normal text-gray-500 dark:text-gray-400">
                <span className="mr-1 rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-500 dark:bg-blue-900 dark:text-blue-300">
                  go.gov.my
                </span>{' '}
                short links can only be created by public officers, so you can
                be sure it&apos;s from a trustworthy source.
              </p>
              <p className="mb-4 text-lg font-normal text-gray-500 dark:text-gray-400">
                Are you a public officer? &nbsp;
                <a
                  href="#"
                  className="inline-flex items-center text-lg font-medium text-blue-600 hover:underline dark:text-blue-500"
                >
                  Sign In Now
                  <svg
                    className="ms-2 h-3.5 w-3.5 rtl:rotate-180"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 10"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M1 5h12m0 0L9 1m4 4L9 9"
                    />
                  </svg>
                </a>
              </p>
            </div>
            <div className="rounded-xs h-96 border border-gray-200 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-800 md:p-12">
              Placeholder
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
