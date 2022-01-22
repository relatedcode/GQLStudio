import { Menu, Transition } from "@headlessui/react";
import {
  CheckIcon,
  DotsVerticalIcon,
  DownloadIcon,
  TrashIcon,
} from "@heroicons/react/outline";
import { UserIcon } from "@heroicons/react/solid";
import AddMember from "components/AddMember";
import Button from "components/Button";
import LoadingSection from "components/LoadingSection";
import TextField from "components/TextField";
import { Formik } from "formik";
import { getFileURL } from "gqlite-lib/dist/client/storage";
import useAuth from "hooks/useAuth";
import useGroupById from "hooks/useGroupById";
import useMembers from "hooks/useMembers";
import { useAddMember } from "hooks/useModals";
import usePermission from "hooks/usePermission";
import { useRouter } from "next/router";
import { Fragment, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { deleteData, fetcher, postData } from "utils/api-helpers";
import classNames from "utils/classNames";
import { downloadJSONFile } from "utils/download";

function MemberItem({
  uid,
  memberPermission,
  userPermission,
  me,
  member,
}: any) {
  const router = useRouter();
  const { groupId } = router.query;

  const handleEditor = async () => {
    try {
      await postData(`/groups/${groupId}/members/${uid}`, {
        permission: "editor",
      });
      toast.success(`${member.email} upgraded to Editor`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleViewer = async () => {
    try {
      await postData(`/groups/${groupId}/members/${uid}`, {
        permission: "viewer",
      });
      toast.success(`${member.email} downgraded to Viewer`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteMember = async (quit?: any) => {
    try {
      await deleteData(`/groups/${groupId}/members/${uid}`);
      toast.success(`${member.email} deleted`);
      if (quit) router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (!member) return null;

  return (
    <tr>
      <td className="px-6 py-3 max-w-0 w-full whitespace-nowrap text-sm font-medium text-white">
        <div className="flex flex-shrink-0 space-x-4 items-center">
          {member.photoURL && (
            <img
              className="max-w-none h-12 w-12 rounded-full ring-2 ring-gray-700"
              src={getFileURL(member.photoURL)}
              alt={member.name}
            />
          )}
          {!member.photoURL && (
            <span className="h-12 w-12 rounded-full overflow-hidden bg-gray-100">
              <svg
                className="h-full w-full text-gray-300"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </span>
          )}
          <span className="font-medium text-base">
            {member.name}
            {me && " (me)"}
          </span>
        </div>
      </td>
      <td className="px-6 py-3 text-sm text-white font-medium">
        {member.email}
      </td>
      <td className="hidden md:table-cell px-6 py-3 whitespace-nowrap text-sm text-white text-right">
        {memberPermission === "Owner" && (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
            Owner
          </span>
        )}
        {memberPermission === "Editor" && (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            Editor
          </span>
        )}
        {memberPermission === "Viewer" && (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            Viewer
          </span>
        )}
      </td>
      <td className="pr-6">
        <Menu as="div" className="relative flex justify-end items-center">
          <Menu.Button
            disabled={
              memberPermission === "Owner" ||
              (!me && userPermission === "Viewer")
            }
            className="w-8 h-8 inline-flex items-center justify-center text-gray-400 rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 ring-offset-gray-700 focus:ring-green-500 disabled:opacity-30"
          >
            <span className="sr-only">Open options</span>
            <DotsVerticalIcon className="w-5 h-5" aria-hidden="true" />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="mx-3 origin-top-right absolute right-7 top-0 w-48 mt-1 rounded-md shadow-lg z-10 bg-gray-700 ring-1 ring-gray-500 divide-y divide-gray-500 focus:outline-none">
              {me && userPermission !== "Owner" && (
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => handleDeleteMember(true)}
                        className={classNames(
                          active ? "bg-gray-600 text-white" : "text-white",
                          "group flex items-center px-4 py-2 text-sm w-full"
                        )}
                      >
                        <TrashIcon
                          className="mr-3 h-5 w-5 text-white"
                          aria-hidden="true"
                        />
                        Leave group
                      </button>
                    )}
                  </Menu.Item>
                </div>
              )}
              {!me &&
                (userPermission === "Owner" || userPermission === "Editor") && (
                  <>
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleViewer()}
                            className={classNames(
                              active ? "bg-gray-600 text-white" : "text-white",
                              "group flex items-center px-4 py-2 text-sm w-full"
                            )}
                          >
                            {memberPermission === "Viewer" && (
                              <CheckIcon
                                className="mr-3 h-5 w-5 text-white"
                                aria-hidden="true"
                              />
                            )}
                            <span
                              style={{
                                marginLeft:
                                  memberPermission !== "Viewer" ? "32px" : "",
                              }}
                            >
                              Viewer
                            </span>
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleEditor()}
                            className={classNames(
                              active ? "bg-gray-600 text-white" : "text-white",
                              "group flex items-center px-4 py-2 text-sm w-full"
                            )}
                          >
                            {memberPermission === "Editor" && (
                              <CheckIcon
                                className="mr-3 h-5 w-5 text-white"
                                aria-hidden="true"
                              />
                            )}
                            <span
                              style={{
                                marginLeft:
                                  memberPermission !== "Editor" ? "32px" : "",
                              }}
                            >
                              Editor
                            </span>
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                    {userPermission === "Owner" && (
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => handleDeleteMember()}
                              className={classNames(
                                active
                                  ? "bg-gray-600 text-white"
                                  : "text-white",
                                "group flex items-center px-4 py-2 text-sm w-full"
                              )}
                            >
                              <TrashIcon
                                className="mr-3 h-5 w-5 text-white"
                                aria-hidden="true"
                              />
                              Delete
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    )}
                  </>
                )}
            </Menu.Items>
          </Transition>
        </Menu>
      </td>
    </tr>
  );
}

function Members() {
  const router = useRouter();
  const { groupId } = router.query;
  const { user } = useAuth();
  const { group } = useGroupById(groupId);

  const { data: members } = useMembers(groupId as string);

  const { userPermission } = usePermission(group, user);

  if (!group || !user) return null;

  return (
    <div className="hidden sm:block">
      <div className="align-middle inline-block min-w-full border-b border-gray-600">
        <table className="min-w-full">
          <thead>
            <tr className="border-t border-gray-600">
              <th className="px-6 py-3 border-b border-gray-600 bg-gray-700 text-left text-xs font-medium text-white uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 border-b border-gray-600 bg-gray-700 text-left text-xs font-medium text-white uppercase tracking-wider">
                Email
              </th>
              <th className="hidden md:table-cell px-6 py-3 border-b border-gray-600 bg-gray-700 text-left text-xs font-medium text-white uppercase tracking-wider">
                Role
              </th>
              <th className="pr-6 py-3 border-b border-gray-600 bg-gray-700 text-right text-xs font-medium text-white uppercase tracking-wider" />
            </tr>
          </thead>
          <tbody className="bg-transparent divide-y divide-gray-600">
            {group.access.map((uid: string) => {
              let permission;
              if (group.ownerId === uid) {
                permission = "Owner";
              } else if (group.write.includes(uid)) {
                permission = "Editor";
              } else {
                permission = "Viewer";
              }
              return (
                <MemberItem
                  key={uid}
                  uid={uid}
                  memberPermission={permission}
                  userPermission={userPermission}
                  me={user.uid === uid}
                  member={members?.find((member) => member.objectId === uid)}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NoGroup() {
  return (
    <main className="flex-grow flex flex-col justify-center max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-full">
      <div className="py-16">
        <div className="text-center">
          <h1 className="mt-2 text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
            Group not found.
          </h1>
          <p className="mt-2 text-base text-gray-200">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function Group() {
  const { setOpen } = useAddMember();
  const router = useRouter();
  const { user } = useAuth();
  const { groupId } = router.query;
  const { group, loading } = useGroupById(groupId);
  const { owner, userPermission, write } = usePermission(group, user);
  const [edit, setEdit] = useState(false);

  const groupNameRef = useRef(null);

  useEffect(() => {
    if (groupId) setEdit(false);
  }, [groupId]);

  useEffect(() => {
    if (edit) groupNameRef.current.focus();
  }, [edit]);

  const handleDelete = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete this group?"
    );
    if (!confirm) return;
    if (groupId) {
      await deleteData(`/groups/${groupId}`);
      router.push("/dashboard");
    }
  };

  if (loading) return <LoadingSection />;
  if (!loading && groupId && !group) return <NoGroup />;

  return (
    <div className="py-6">
      <div className="mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
        {!edit && (
          <>
            <h1 className="text-3xl font-bold text-white">{group?.title}</h1>
            {write && (
              <Button white text="Edit" onClick={() => setEdit(true)} />
            )}
          </>
        )}
        {edit && (
          <Formik
            initialValues={{
              title: group?.title || "",
            }}
            onSubmit={async ({ title }, { setSubmitting }) => {
              setSubmitting(true);
              try {
                await postData(`/groups/${groupId}`, {
                  title,
                });
                toast.success("Group updated");
                setEdit(false);
              } catch (err: any) {
                toast.error(err.message);
              }
              setSubmitting(false);
            }}
          >
            {({
              values,
              handleChange,
              isSubmitting,
              handleSubmit,
              resetForm,
              dirty,
            }) => (
              <form
                className="flex items-center w-full"
                onSubmit={handleSubmit}
              >
                <TextField
                  value={values.title}
                  handleChange={handleChange}
                  required
                  name="title"
                  type="text"
                  ref={groupNameRef}
                  className="w-full"
                />
                <Button
                  className="disabled:opacity-50"
                  text="Save"
                  disabled={!dirty}
                  loading={isSubmitting}
                  type="submit"
                />
                <Button
                  white
                  text="Cancel"
                  loading={isSubmitting}
                  onClick={() => {
                    resetForm();
                    setEdit(false);
                  }}
                />
              </form>
            )}
          </Formik>
        )}
      </div>
      <div>
        <div className="py-6 pt-12">
          <div className="flex items-center justify-between mb-4 mx-auto sm:px-6 md:px-8">
            <span className="font-medium text-lg text-gray-200">Members</span>
            {(userPermission === "Owner" || userPermission === "Editor") && (
              <Button
                icon={<UserIcon className="h-4 w-4 text-white mr-2" />}
                text="Add member"
                onClick={() => setOpen(true)}
              />
            )}
          </div>
          <Members />
          <AddMember />
        </div>

        {owner && (
          <div className="mt-10 flex justify-between mx-auto sm:px-6 md:px-8">
            <button
              type="button"
              onClick={() => handleDelete()}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 ring-offset-gray-800 focus:ring-red-500"
            >
              <TrashIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Delete
            </button>
            <button
              type="button"
              onClick={async () => {
                const res = await fetcher(`/groups/${groupId}/export`);
                downloadJSONFile(res, `${groupId}.json`);
              }}
              className="inline-flex items-center px-4 py-2 border-transparent shadow-sm text-sm font-medium rounded-md bg-transparent border border-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ring-offset-gray-800 focus:ring-green-500"
            >
              <DownloadIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Export
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
