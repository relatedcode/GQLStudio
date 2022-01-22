/* eslint-disable */

import { Menu } from "@headlessui/react";
import {
  PaperAirplaneIcon,
  TrashIcon,
  UsersIcon,
} from "@heroicons/react/outline";
import useAuth from "hooks/useAuth";
import useContextMenu from "hooks/useContextMenu";
import { useCreateGroup } from "hooks/useModals";
import usePermission from "hooks/usePermission";
import { useRouter } from "next/router";
import { useRef } from "react";
import toast from "react-hot-toast";
import { deleteData, postData } from "utils/api-helpers";
import wait from "utils/wait";

export default function MenuWithContext({
  type,
  group,
  requestId,
  children,
  className,
}: any) {
  const outerRef = useRef(null);
  const { setOpen: setOpenCreateGroup } = useCreateGroup();
  const { menu, showMenu, xPos, yPos } = useContextMenu(outerRef);
  const router = useRouter();
  const { user } = useAuth();
  const { write, owner } = usePermission(group, user);

  const groupId = group?.objectId;

  const handleModalClose = () => {
    showMenu(false);
  };

  const handleCreateRequest = async () => {
    try {
      const { id } = await postData(`/groups/${groupId}/requests`);
      handleModalClose();
      router.push(`/dashboard/groups/${groupId}/requests/${id}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this group?"
      );
      if (!confirm) return;
      await deleteData(`/groups/${groupId}`);
      handleModalClose();
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteRequest = async () => {
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this request?"
      );
      if (!confirm) return;
      await deleteData(`/groups/${groupId}/requests/${requestId}`);
      handleModalClose();
      router.push(`/dashboard/groups/${groupId}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCreateGroup = async () => {
    await wait(200);
    handleModalClose();
    setOpenCreateGroup(true);
  };

  if (!user || !group) return null;

  return (
    <Menu as="div">
      <Menu.Button ref={outerRef} className={className}>
        {children}
      </Menu.Button>

      {menu && (
        <>
          <div
            onClick={() => handleModalClose()}
            className="fixed inset-0 z-20"
          />
          <Menu.Items
            static
            className="absolute z-30 w-56 mt-2 origin-top-right bg-gray-700 divide-y divide-gray-400 rounded-md shadow-lg ring-1 ring-gray-500 focus:outline-none"
            as="div"
            style={{ top: yPos, left: xPos }}
          >
            <div className="px-1 py-1 ">
              <Menu.Item>
                <button
                  onClick={handleCreateGroup}
                  className="text-white group flex rounded-md items-center w-full px-2 py-2 text-sm"
                >
                  <UsersIcon
                    className="w-5 h-5 mr-2 text-white"
                    aria-hidden="true"
                  />
                  New Group
                </button>
              </Menu.Item>
              {write && groupId && (
                <Menu.Item>
                  <button
                    onClick={handleCreateRequest}
                    className="text-white group flex rounded-md items-center w-full px-2 py-2 text-sm"
                  >
                    <PaperAirplaneIcon
                      className="w-5 h-5 mr-2 text-white"
                      aria-hidden="true"
                    />
                    New Request
                  </button>
                </Menu.Item>
              )}
              {type === "group" && owner && groupId && (
                <Menu.Item>
                  <button
                    onClick={() => handleDeleteGroup()}
                    className="text-red-500 group flex rounded-md items-center w-full px-2 py-2 text-sm"
                  >
                    <TrashIcon
                      className="w-5 h-5 mr-2 text-red-500"
                      aria-hidden="true"
                    />
                    Delete Group
                  </button>
                </Menu.Item>
              )}
              {type === "request" && owner && requestId && (
                <Menu.Item>
                  <button
                    onClick={() => handleDeleteRequest()}
                    className="text-red-500 group flex rounded-md items-center w-full px-2 py-2 text-sm"
                  >
                    <TrashIcon
                      className="w-5 h-5 mr-2 text-red-500"
                      aria-hidden="true"
                    />
                    Delete Request
                  </button>
                </Menu.Item>
              )}
            </div>
          </Menu.Items>
        </>
      )}
    </Menu>
  );
}
