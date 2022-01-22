import { DatabaseIcon, PlusIcon, UsersIcon } from "@heroicons/react/outline";
import Button from "components/Button";
import { useCreateGroup, useCreateProject } from "hooks/useModals";
import useUser from "hooks/useUser";
import { useRouter } from "next/router";
import classNames from "utils/classNames";

const actions = [
  {
    title: "Groups",
    href: "/dashboard/groups",
    icon: UsersIcon,
    iconForeground: "text-green-700",
    iconBackground: "bg-green-50",
    infos: "Create GraphQL requests and share them with your teammates.",
  },
  {
    title: "Projects",
    href: "/dashboard/projects",
    icon: DatabaseIcon,
    iconForeground: "text-pink-700",
    iconBackground: "bg-pink-50",
    infos: "Create fully managed backends with your DigitalOcean account.",
  },
];

function Cards() {
  const router = useRouter();
  return (
    <div className="rounded-lg bg-transparent overflow-hidden shadow divide-y divide-gray-700 sm:divide-y-0 sm:grid sm:grid-cols-2 sm:gap-px my-10">
      {actions.map((action, actionIdx) => (
        <div
          key={action.title}
          className={classNames(
            actionIdx === 0
              ? "rounded-tl-lg rounded-tr-lg sm:rounded-tr-none"
              : "",
            actionIdx === 1 ? "sm:rounded-tr-lg" : "",
            actionIdx === actions.length - 2 ? "sm:rounded-bl-lg" : "",
            actionIdx === actions.length - 1
              ? "rounded-bl-lg rounded-br-lg sm:rounded-bl-none"
              : "",
            "relative group bg-gray-700 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500"
          )}
        >
          <div>
            <span
              className={classNames(
                action.iconBackground,
                action.iconForeground,
                "rounded-lg inline-flex p-3 ring-4 ring-gray-700"
              )}
            >
              <action.icon className="h-6 w-6" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium">
              <div
                onClick={() => {
                  router.push(action.href);
                }}
                className="focus:outline-none cursor-pointer text-white"
              >
                {/* Extend touch target to entire panel */}
                <span className="absolute inset-0" aria-hidden="true" />
                {action.title}
              </div>
            </h3>
            <p className="mt-2 text-sm text-gray-200">{action.infos}</p>
          </div>
          <span
            className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
            aria-hidden="true"
          >
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
            </svg>
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user: data } = useUser();
  const { setOpen: setOpenGroup } = useCreateGroup();
  const { setOpen: setOpenProject } = useCreateProject();
  const router = useRouter();
  const type = router.pathname.includes("/projects") ? "projects" : "groups";
  return (
    <div className="py-6">
      <div className="mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Welcome, {data?.name}</h1>
        <Button
          icon={<PlusIcon className="h-4 w-4 text-white mr-2" />}
          text={type === "projects" ? "New Project" : "New Group"}
          onClick={() =>
            type === "projects" ? setOpenProject(true) : setOpenGroup(true)
          }
        />
      </div>
      <div className="mx-auto px-4 sm:px-6 md:px-8">
        <Cards />
      </div>
    </div>
  );
}
