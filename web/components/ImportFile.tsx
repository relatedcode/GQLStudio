import { Dialog, Transition } from "@headlessui/react";
import { ArchiveIcon } from "@heroicons/react/outline";
import Button from "components/Button";
import Spinner from "components/Spinner";
import { useFormik } from "formik";
import { uploadFile } from "gqlite-lib/dist/client/storage";
import { now } from "gqlite-lib/dist/client/utils";
import { useImportFile } from "hooks/useModals";
import { useRouter } from "next/router";
import { Fragment, useRef, useState } from "react";
import toast from "react-hot-toast";
import { postData } from "utils/api-helpers";

export default function ImportFile() {
  const { open, setOpen } = useImportFile();
  const router = useRouter();

  const fileRef = useRef(null);
  const [file, setFile] = useState<File | null>(null);

  const handleSaveFile = async () => {
    try {
      const fileURL = await uploadFile(
        "imports",
        `${file.name}-${now()}.json`,
        file
      );
      return fileURL;
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const formik = useFormik({
    initialValues: {},
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        const data = await postData("/groups/import", {
          url: await handleSaveFile(),
        });
        toast.success("Template imported");
        setFile(null);
        fileRef.current.value = "";
        setOpen(false);
        router.push(`/dashboard/groups/${data.id}`);
      } catch (err: any) {
        toast.error(err.message);
      }
      setSubmitting(false);
    },
  });

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={setOpen}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-50 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <form
              onSubmit={formik.handleSubmit}
              className="inline-block align-bottom bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
            >
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ArchiveIcon
                    className="h-6 w-6 text-green-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <Dialog.Title
                    as="h3"
                    className="text-lg leading-6 font-medium text-white"
                  >
                    Import file
                  </Dialog.Title>
                  <div className="my-4 mt-6 w-full space-y-4">
                    <div>
                      <label>
                        <span className="sr-only">Choose file</span>
                        <input
                          type="file"
                          ref={fileRef}
                          accept="application/json"
                          onChange={(e) => setFile(e.target.files[0])}
                          className="block cursor-pointer focus:outline-none border-0 w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="w-full inline-flex items-center justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 ring-offset-gray-800 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {formik.isSubmitting && <Spinner className="mr-2" />}
                  Import
                </button>
                <Button text="Cancel" white onClick={() => setOpen(false)} />
              </div>
            </form>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
