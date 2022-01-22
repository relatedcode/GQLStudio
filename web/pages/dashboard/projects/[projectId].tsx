import {
  CheckIcon,
  ClipboardIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  TrashIcon,
} from "@heroicons/react/outline";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/solid";
import Button from "components/Button";
import { regionOptions, sizeOptions } from "components/CreateProject";
import { css } from "components/editor/css";
import Style from "components/editor/Style";
import LoadingSection from "components/LoadingSection";
import Spinner from "components/Spinner";
import TextField from "components/TextField";
import { Formik } from "formik";
import useProjectById from "hooks/useProjectById";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import { CopyToClipboard } from "react-copy-to-clipboard";
import toast from "react-hot-toast";
import { deleteData, postData } from "utils/api-helpers";

function ShowSecret({ label, value }) {
  const [show, setShow] = useState(false);
  const [displayCopyConfirm, setDisplayCopyConfirm] = useState(false);

  useEffect(() => {
    const timeId = setTimeout(() => {
      setDisplayCopyConfirm(false);
    }, 700);

    return () => {
      clearTimeout(timeId);
    };
  }, [displayCopyConfirm]);

  return (
    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
      <dt className="text-sm font-medium text-gray-200">{label}</dt>
      <dd className="mt-1 font-mono text-sm text-white sm:mt-0 sm:col-span-2 flex items-center">
        <span className="flex-grow">
          {show ? value : "*************************"}
        </span>
        <div className="space-x-5">
          <button onClick={() => setShow(!show)}>
            {show ? (
              <EyeOffIcon className="h-5 w-5 text-gray-200" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-200" />
            )}
          </button>
          <CopyToClipboard text={value}>
            <button onClick={() => setDisplayCopyConfirm(true)}>
              {!displayCopyConfirm && (
                <ClipboardIcon className="h-5 w-5 text-gray-200" />
              )}
              {displayCopyConfirm && (
                <CheckIcon className="h-5 w-5 text-green-500" />
              )}
            </button>
          </CopyToClipboard>
        </div>
      </dd>
    </div>
  );
}

function ProjectDescription({ project }: { project: any }) {
  return (
    <div className="bg-gray-700 shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-white">
          Project details
        </h3>
      </div>
      <div className="border-t border-gray-400 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-500">
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-200">ID</dt>
            <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2 font-mono flex items-center">
              <span className="flex-grow">{project.objectId}</span>
              <CopyToClipboard text={project.objectId}>
                <button>
                  <ClipboardIcon className="h-5 w-5 text-gray-700" />
                </button>
              </CopyToClipboard>
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-200">Region</dt>
            <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2 flex items-center">
              {regionOptions.find((reg) => reg.value === project.region)?.title}
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-200">Machine size</dt>
            <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2 flex items-center">
              {sizeOptions.find((siz) => siz.value === project.size)?.title}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function ProjectSecrets({ project }: { project: any }) {
  let type;
  if (project.type === "hasura") type = "Hasura";
  if (project.type === "directus") type = "Directus";
  if (project.type === "gqlserver") type = "GraphQLite";
  return (
    <div className="bg-gray-700 shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-white">
          {type} secrets
        </h3>
      </div>
      <div className="border-t border-gray-400 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-500">
          {project.type === "hasura" && (
            <>
              <ShowSecret
                label="Admin Secret"
                value={project.hasuraAdminSecret}
              />
              <ShowSecret
                label="DB Password"
                value={project.hasuraDBPassword}
              />
            </>
          )}
          {project.type === "directus" && (
            <>
              <ShowSecret
                label="Admin Email"
                value={project.directusAdminEmail}
              />
              <ShowSecret
                label="Admin Password"
                value={project.directusAdminPassword}
              />
              <ShowSecret label="Key" value={project.directusKey} />
              <ShowSecret label="Secret" value={project.directusSecret} />
              <ShowSecret
                label="DB Password"
                value={project.directusDBPassword}
              />
            </>
          )}
          {project.type === "gqlserver" && (
            <>
              <ShowSecret
                label="Admin Email"
                value={project.gqliteAdminEmail}
              />
              <ShowSecret
                label="Admin Password"
                value={project.gqliteAdminPassword}
              />
              <ShowSecret label="Secret Key" value={project.gqliteSecretKey} />
              <ShowSecret
                label="Minio Password"
                value={project.gqliteMinioPassword}
              />
              <ShowSecret
                label="Redis Password"
                value={project.gqliteRedisPassword}
              />
              <ShowSecret
                label="DB Password"
                value={project.gqliteDBPassword}
              />
            </>
          )}
        </dl>
      </div>
    </div>
  );
}

function NoProject() {
  return (
    <main className="flex-grow flex flex-col justify-center max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-full">
      <div className="py-16">
        <div className="text-center">
          <h1 className="mt-2 text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
            Project not found.
          </h1>
          <p className="mt-2 text-base text-gray-200">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function Project() {
  const router = useRouter();
  const { projectId } = router.query;
  const { data: project, loading } = useProjectById(projectId as string);
  const [edit, setEdit] = useState(false);
  const [logs, setLogs] = useState("");

  const newProject = project?.status === "new";
  const offProject = project?.status === "off";
  const activeProject = project?.status === "active";

  const handleDelete = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete this project? All your data will be lost."
    );
    if (!confirm) return;
    if (projectId) {
      await deleteData(`/projects/${projectId}`);
      router.push("/dashboard/projects");
    }
  };

  useEffect(() => {
    if (project) {
      let str = "";
      project.logs.forEach((log: string) => {
        str = str.concat(`${log}\n`);
      });
      setLogs(str);
    }
  }, [project]);

  useEffect(() => {
    if (projectId) setEdit(false);
  }, [projectId]);

  if (loading) return <LoadingSection />;
  if (!loading && projectId && !project) return <NoProject />;

  return (
    <div className="py-6">
      <div className="mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
        {!edit && (
          <>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-white">
                {project?.title}
              </h1>
              {activeProject && (
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              )}
              {offProject && <XCircleIcon className="h-8 w-8 text-red-500" />}
            </div>
            <div className="flex items-center space-x-3">
              <Button white text="Edit" onClick={() => setEdit(true)} />
              {activeProject && (
                <Button
                  icon={
                    <ExternalLinkIcon className="h-4 w-4 text-white mr-2" />
                  }
                  text="Launch console"
                  onClick={() => window.open(project.link)}
                />
              )}
            </div>
          </>
        )}
        {edit && (
          <Formik
            initialValues={{
              title: project?.title || "",
            }}
            onSubmit={async ({ title }, { setSubmitting }) => {
              setSubmitting(true);
              try {
                await postData(`/projects/${projectId}`, { title });
                toast.success("Project updated");
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
        <div className="p-6 pt-12">
          {newProject || offProject ? (
            <>
              {newProject && (
                <div className="font-medium text-gray-200 pb-4 flex items-center">
                  <span className="px-2">
                    We are creating the resources of your project...
                  </span>
                  <Spinner className="ml-4" />
                </div>
              )}
              <div className="w-full">
                <CodeMirror
                  value={logs}
                  options={{
                    lineNumbers: true,
                    lineWrapping: true,
                    tabSize: 2,
                    mode: "text",
                    theme: "custom-project",
                    autoCloseBrackets: true,
                    matchBrackets: true,
                    showCursorWhenSelecting: true,
                    readOnly: true,
                    foldGutter: {
                      minFoldSize: 2,
                    },
                  }}
                  onBeforeChange={(editor, data, value) => {
                    setLogs(value);
                  }}
                />
                <Style css={css} />
              </div>
            </>
          ) : (
            <div className="space-y-10">
              <ProjectDescription project={project} />
              <ProjectSecrets project={project} />
            </div>
          )}
        </div>

        {project.status !== "new" && (
          <div className="mt-10 mx-auto sm:px-6 md:px-8">
            <button
              type="button"
              onClick={() => handleDelete()}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 ring-offset-gray-800 focus:ring-red-500"
            >
              <TrashIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
