import { Dialog, Transition } from "@headlessui/react";
import { DatabaseIcon } from "@heroicons/react/outline";
import Button from "components/Button";
import Select from "components/Select";
import Spinner from "components/Spinner";
import TextField from "components/TextField";
import { useFormik } from "formik";
import { useCreateProject } from "hooks/useModals";
import { useRouter } from "next/router";
import { Fragment } from "react";
import toast from "react-hot-toast";
import { postData } from "utils/api-helpers";

export const regionOptions = [
  {
    title: "New York City",
    value: "nyc1",
  },
  {
    title: "San Francisco",
    value: "sfo3",
  },
  {
    title: "Amsterdam",
    value: "ams3",
  },
  {
    title: "Singapore",
    value: "sgp1",
  },
  {
    title: "London",
    value: "lon1",
  },
  {
    title: "Frankfurt",
    value: "fra1",
  },
  {
    title: "Toronto",
    value: "tor1",
  },
  {
    title: "Bangalore",
    value: "blr1",
  },
];

export const sizeOptions = [
  {
    title: "1 GB - 1 vCPU (5$/mo)",
    value: "s-1vcpu-1gb",
  },
  {
    title: "2 GB - 2 vCPUs (18$/mo)",
    value: "s-2vcpu-2gb-amd",
  },
  {
    title: "8 GB - 4 AMD vCPUs (48$/mo)",
    value: "s-4vcpu-8gb-amd",
  },
];

export const projectOptions = [
  {
    title: "Hasura",
    value: "hasura",
  },
  {
    title: "Directus",
    value: "directus",
  },
  {
    title: "GraphQLite",
    value: "gqlserver",
  },
];

export default function CreateProject() {
  const { setOpen, open } = useCreateProject();
  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      type: projectOptions[0].value,
      name: "",
      region: regionOptions[0].value,
      size: sizeOptions[0].value,
    },
    onSubmit: async (
      { name, region, size, type },
      { setSubmitting, resetForm }
    ) => {
      setSubmitting(true);
      try {
        const { id } = await postData("/projects", {
          region,
          size,
          type,
          title: name,
        });
        resetForm();
        setOpen(false);
        router.push(`/dashboard/projects/${id}`);
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
        open={open}
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
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-pink-100 sm:mx-0 sm:h-10 sm:w-10">
                  <DatabaseIcon
                    className="h-6 w-6 text-pink-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <Dialog.Title
                    as="h3"
                    className="text-lg leading-6 font-semibold text-white"
                  >
                    Create Project
                  </Dialog.Title>
                  <div className="my-4 w-full space-y-2">
                    <p className="text-sm text-gray-200">
                      Create fully managed backends with your DigitalOcean
                      account.
                    </p>
                    <Select
                      setFieldValue={formik.setFieldValue}
                      value={formik.values.type}
                      name="type"
                      label="Project type"
                      options={projectOptions}
                    />
                    <TextField
                      value={formik.values.name}
                      handleChange={formik.handleChange}
                      required
                      label="Name"
                      name="name"
                      type="text"
                    />
                    <Select
                      setFieldValue={formik.setFieldValue}
                      value={formik.values.region}
                      name="region"
                      label="Region"
                      options={regionOptions}
                    />
                    <Select
                      setFieldValue={formik.setFieldValue}
                      value={formik.values.size}
                      name="size"
                      label="Droplet size"
                      options={sizeOptions}
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
                  Create
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
