import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  ArchiveIcon,
  DatabaseIcon,
  PaperAirplaneIcon,
  PlusIcon,
  UploadIcon,
  UsersIcon,
} from "@heroicons/react/outline";
import { ChevronDoubleLeftIcon } from "@heroicons/react/solid";
import MenuWithContext from "components/CustomContextMenu";
import useAuth from "hooks/useAuth";
import useGroupById from "hooks/useGroupById";
import useGroups from "hooks/useGroups";
import {
  useCreateGroup,
  useCreateProject,
  useImportFile,
  useImportTemplate,
} from "hooks/useModals";
import usePermission from "hooks/usePermission";
import useProjects from "hooks/useProjects";
import useRequestsByGroup from "hooks/useRequestsByGroup";
import useSidebar from "hooks/useSidebar";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment } from "react";
import toast from "react-hot-toast";
import { postData } from "utils/api-helpers";
import classNames from "utils/classNames";

function Group({ group }: any) {
  const router = useRouter();
  const { groupId, requestId } = router.query;

  const { data: requests } = useRequestsByGroup(group.objectId);

  return (
    <Disclosure as="div" className="space-y-1">
      {() => (
        <>
          <MenuWithContext
            className="w-full focus:outline-none"
            type="group"
            group={group}
          >
            <Disclosure.Button
              as="div"
              className={classNames(
                groupId === group.objectId
                  ? "bg-gray-700 text-white"
                  : "bg-gray-700 text-white",
                "group w-[15rem] flex items-center pr-2 text-left text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              )}
            >
              <Link href={`/dashboard/groups/${group.objectId}`}>
                <a className="flex items-center w-[15rem] overflow-x-auto py-2">
                  <svg
                    className={classNames(
                      groupId === group.objectId
                        ? "text-white rotate-90"
                        : "text-white",
                      "mr-2 flex-shrink-0 h-5 w-5 transform group-hover:text-gray-400 transition-colors ease-in-out duration-150"
                    )}
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M6 6L14 10L6 14V6Z" fill="currentColor" />
                  </svg>
                  {group.title}
                </a>
              </Link>
            </Disclosure.Button>
          </MenuWithContext>
          {groupId === group.objectId && (
            <Disclosure.Panel static className="space-y-1">
              {requests.map((subItem: any) => (
                <MenuWithContext
                  key={subItem.objectId}
                  type="request"
                  group={group}
                  requestId={subItem.objectId}
                  className="w-full focus:outline-none"
                >
                  <Link
                    href={`/dashboard/groups/${group.objectId}/requests/${subItem.objectId}`}
                  >
                    <a
                      className={classNames(
                        requestId === subItem.objectId
                          ? "bg-gray-600 text-white"
                          : "text-gray-300",
                        "group w-[15rem] overflow-x-auto flex items-center pl-10 pr-2 py-2 text-sm font-medium rounded-md"
                      )}
                    >
                      {subItem.title}
                    </a>
                  </Link>
                </MenuWithContext>
              ))}
            </Disclosure.Panel>
          )}
        </>
      )}
    </Disclosure>
  );
}

function Project({ project }: any) {
  const router = useRouter();
  return (
    <div
      className={classNames(
        router.query.projectId === project.objectId
          ? "bg-gray-600 text-white"
          : "text-gray-300",
        "group w-full flex items-center px-4 py-2 text-left text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
      )}
    >
      <Link href={`/dashboard/projects/${project.objectId}`}>
        <a className="flex items-center w-full">{project.title}</a>
      </Link>
    </div>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const { groupId } = router.query;
  const { groups } = useGroups();
  const { projects } = useProjects();
  const { user } = useAuth();
  const { setOpen: setOpenCreateGroup } = useCreateGroup();
  const { setOpen: setOpenCreateProject } = useCreateProject();
  const { setOpen: setImportTemplate } = useImportTemplate();
  const { setOpen: setImportFile } = useImportFile();
  const { group } = useGroupById(groupId);
  const { write } = usePermission(group, user);

  const { setShow } = useSidebar();

  const type = router.pathname.includes("/projects") ? "projects" : "groups";
  const profile = router.pathname.includes("/profile");

  const handleCreateRequest = async () => {
    try {
      const { id } = await postData(`/groups/${groupId}/requests`);
      router.push(`/dashboard/groups/${groupId}/requests/${id}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="hidden md:flex md:flex-shrink-0 w-64">
      <div className="flex flex-col flex-grow border-r border-gray-600 pt-5 pb-4 bg-gray-700">
        <div className="flex items-center flex-shrink-0 px-4 relative">
          <Link href="/dashboard">
            <a>
              <img className="h-14 w-auto" src="/logo.png" alt="" />
            </a>
          </Link>
          <button
            className="absolute top-1 right-6"
            onClick={() => setShow(false)}
          >
            <ChevronDoubleLeftIcon className="h-5 w-5 text-white" />
          </button>
        </div>
        <div className="mt-8 flex-grow flex flex-col flex-1 overflow-y-auto">
          {!profile && (
            <div className="uppercase px-3 font-medium text-white mb-4">
              {type}
            </div>
          )}
          <nav
            className="flex-1 px-2 space-y-1 bg-transparent my-2"
            aria-label="Sidebar"
          >
            {!profile && (
              <>
                {type === "groups" &&
                  groups.map((item: any) => (
                    <Group key={item.objectId} group={item} />
                  ))}
                {type === "projects" &&
                  projects.map((item: any) => (
                    <Project key={item.objectId} project={item} />
                  ))}
              </>
            )}
          </nav>
        </div>
        <nav
          className="px-2 space-y-1 bg-transparent mt-auto"
          aria-label="Sidebar"
        >
          <Menu as="div" className="relative">
            <div>
              <Menu.Button className="bg-transparent text-white group w-full flex items-center pr-2 py-2 text-left text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                <div className="flex items-center w-full">
                  <PlusIcon className="h-5 w-5 flex-shrink-0 mr-2 ml-1" />
                  New
                </div>
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
              <Menu.Items className="absolute bottom-0 w-56 mt-2 origin-top-right bg-gray-700 divide-y divide-gray-400 rounded-md shadow-lg ring-1 ring-gray-500 focus:outline-none">
                {type === "projects" ? (
                  <div className="px-1 py-1 ">
                    <Menu.Item>
                      <button
                        onClick={() => setOpenCreateProject(true)}
                        className="text-white group flex rounded-md items-center w-full px-2 py-2 text-sm"
                      >
                        <DatabaseIcon
                          className="w-5 h-5 mr-2 text-white"
                          aria-hidden="true"
                        />
                        Create Project
                      </button>
                    </Menu.Item>
                  </div>
                ) : (
                  <>
                    <div className="px-1 py-1 ">
                      <Menu.Item>
                        <button
                          onClick={() => setOpenCreateGroup(true)}
                          className="text-white group flex rounded-md items-center w-full px-2 py-2 text-sm"
                        >
                          <UsersIcon
                            className="w-5 h-5 mr-2 text-white"
                            aria-hidden="true"
                          />
                          Create Group
                        </button>
                      </Menu.Item>
                      {groupId && write && (
                        <Menu.Item>
                          <button
                            onClick={() => handleCreateRequest()}
                            className="text-white group flex rounded-md items-center w-full px-2 py-2 text-sm"
                          >
                            <PaperAirplaneIcon
                              className="w-5 h-5 mr-2 text-white"
                              aria-hidden="true"
                            />
                            Create Request
                          </button>
                        </Menu.Item>
                      )}
                    </div>

                    <div className="px-1 py-1">
                      <Menu.Item>
                        <button
                          onClick={() => setImportTemplate(true)}
                          className="text-white group flex rounded-md items-center w-full px-2 py-2 text-sm"
                        >
                          <ArchiveIcon
                            className="w-5 h-5 mr-2 text-white"
                            aria-hidden="true"
                          />
                          Import template
                        </button>
                      </Menu.Item>
                      <Menu.Item>
                        <button
                          onClick={() => setImportFile(true)}
                          className="text-white group flex rounded-md items-center w-full px-2 py-2 text-sm"
                        >
                          <UploadIcon
                            className="w-5 h-5 mr-2 text-white"
                            aria-hidden="true"
                          />
                          Import file
                        </button>
                      </Menu.Item>
                    </div>
                  </>
                )}
              </Menu.Items>
            </Transition>
          </Menu>
        </nav>
      </div>
    </div>
  );
}
