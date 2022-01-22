import { Menu, Transition } from "@headlessui/react";
import { SwitchHorizontalIcon } from "@heroicons/react/outline";
import { ChevronDoubleRightIcon } from "@heroicons/react/solid";
import CreateGroup from "components/CreateGroup";
import CreateProject from "components/CreateProject";
import DashboardSidebar from "components/DashboardSidebar";
import ImportFile from "components/ImportFile";
import ImportTemplate from "components/ImportTemplate";
import LoadingScreen from "components/LoadingScreen";
import { getFileURL } from "gqlite-lib/dist/client/storage";
import useAuth from "hooks/useAuth";
import useSidebar from "hooks/useSidebar";
import useUser from "hooks/useUser";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { Fragment } from "react";
import classNames from "utils/classNames";

function MyLink(props) {
  let { href, children, ...rest } = props;
  return (
    <Link href={href}>
      <a {...rest}>{children}</a>
    </Link>
  );
}

const userNavigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Profile", href: "/dashboard/profile" },
  { name: "DigitalOcean", href: "/dashboard/projects/settings" },
  { name: "Sign out", href: "/authentication/logout" },
];

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user: userAuth } = useAuth();
  const { user } = useUser();
  const { show, setShow } = useSidebar();

  if (!userAuth) return <LoadingScreen />;

  const type = router.pathname.includes("/projects") ? "projects" : "groups";
  const profile = router.pathname.includes("/profile");
  const credentials = router.pathname === "/dashboard/projects/settings";

  return (
    <div className="h-screen flex overflow-hidden bg-gray-800">
      {show && <DashboardSidebar />}
      <CreateGroup />
      <CreateProject />
      <ImportTemplate />
      <ImportFile />
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-gray-700 shadow">
          <div className="flex-1 px-5 flex justify-end relative">
            {!show && (
              <button
                className="absolute hidden md:block top-5 left-6"
                onClick={() => setShow(true)}
              >
                <ChevronDoubleRightIcon className="h-5 w-5 text-white" />
              </button>
            )}

            <div className="ml-4 flex items-center md:ml-6">
              {!profile && !credentials && (
                <>
                  {type === "projects" ? (
                    <Link href="/dashboard/groups">
                      <a className="mx-6 flex items-center space-x-2 text-green-500">
                        <SwitchHorizontalIcon className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium">Groups</span>
                      </a>
                    </Link>
                  ) : (
                    <Link href="/dashboard/projects">
                      <a className="mx-6 flex items-center space-x-2 text-green-500">
                        <SwitchHorizontalIcon className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium">Projects</span>
                      </a>
                    </Link>
                  )}
                </>
              )}

              {/* Profile dropdown */}
              <Menu as="div" className="z-20 ml-3 relative">
                <div>
                  <Menu.Button className="max-w-xs bg-gray-700 flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 ring-offset-gray-700 focus:ring-green-500">
                    <span className="sr-only">Open user menu</span>
                    {user?.photoURL && (
                      <img
                        className="h-8 w-8 rounded-full"
                        src={getFileURL(user?.photoURL)}
                        alt=""
                      />
                    )}
                    {!user?.photoURL && (
                      <span className="h-8 w-8 rounded-full overflow-hidden bg-gray-100">
                        <svg
                          className="h-full w-full text-gray-300"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </span>
                    )}
                  </Menu.Button>
                </div>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-gray-700 ring-1 ring-gray-600 focus:outline-none">
                    {userNavigation.map((item) => (
                      <Menu.Item key={item.name}>
                        {({ active }) => (
                          <MyLink
                            href={item.href}
                            className={classNames(
                              active ? "bg-gray-600" : "",
                              "block px-4 py-2 text-sm text-white focus:outline-none"
                            )}
                          >
                            {item.name}
                          </MyLink>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
