import { Dialog, Transition } from "@headlessui/react";
import { ArchiveIcon } from "@heroicons/react/outline";
import Button from "components/Button";
import Spinner from "components/Spinner";
import { useFormik } from "formik";
import { useImportTemplate } from "hooks/useModals";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetcher, postData } from "utils/api-helpers";

function ListBox({ setSelected, selectedTemplate, templates }: any) {
  return (
    <div>
      <label
        htmlFor="title"
        className="block text-sm font-medium text-gray-200"
      >
        Select a template
      </label>
      <select
        id="title"
        name="title"
        value={selectedTemplate}
        onChange={(e) => setSelected("title", e.target.value)}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-transparent border-gray-500 text-white focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
      >
        {templates.map((template: any) => (
          <option key={template}>{template}</option>
        ))}
      </select>
    </div>
  );
}

export default function ImportTemplate() {
  const { open, setOpen } = useImportTemplate();
  const router = useRouter();

  const [templates, setTemplates] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data } = await fetcher("/templates");
      setTemplates(data);
    })();
  }, []);

  const formik = useFormik({
    initialValues: {
      title: templates ? templates[0] : "",
    },
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        const data = await postData("/groups", {
          template: values.title,
        });
        toast.success("Template created");
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
                    Import template
                  </Dialog.Title>
                  <div className="my-4 w-full space-y-4">
                    <ListBox
                      templates={templates}
                      setSelected={formik.setFieldValue}
                      selectedTemplate={formik.values.title}
                    />
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
