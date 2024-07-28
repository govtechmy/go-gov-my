import LocaleSwitcher from "../switcher/switcher";

export default function HomeNavBar() {
  // { session }: { session: any }
  const session = {
    user: {
      name: "John Doe",
      email: "farhan.gunz@gmail.com",
    },
  };
  //   const session = undefined;

  return (
    <>
      <nav className="border-gray-200 bg-white dark:bg-gray-900">
        <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
          <a
            href="https://go.gov.my/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <img src="/_static/logo.png" className="h-8" alt="GoGovMy Logo" />
            <span className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">
              GoGovMY
            </span>
          </a>
          <button
            data-collapse-toggle="navbar-default"
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 md:hidden"
            aria-controls="navbar-default"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="h-5 w-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
          <div className="hidden w-full md:block md:w-auto" id="navbar-default">
            <ul className="mt-4 flex flex-col rounded-lg border border-gray-100 bg-gray-50 p-4 font-medium rtl:space-x-reverse dark:border-gray-700 dark:bg-gray-800 md:mt-0 md:flex-row md:space-x-8 md:border-0 md:bg-white md:p-0 md:dark:bg-gray-900">
              <li className="mt-1">
                {!session ? (
                  <>
                    {/* mb-2 me-2 */}
                    <a
                      href="/login"
                      className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                    >
                      Sign In
                    </a>
                  </>
                ) : (
                  <>
                    <a
                      href="/"
                      className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                    >
                      Dashboard
                    </a>
                  </>
                )}
              </li>
              <li>
                <LocaleSwitcher />
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
