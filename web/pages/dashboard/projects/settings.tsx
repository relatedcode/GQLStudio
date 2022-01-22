import Button from "components/Button";
import Spinner from "components/Spinner";
import TextField from "components/TextField";
import { Formik } from "formik";
import toast from "react-hot-toast";
import useSWR from "swr";
import { fetcher, postData } from "utils/api-helpers";

function SSHPrivateKeyInput({ value, onChange }) {
  return (
    <div className="sm:col-span-6">
      <label
        htmlFor="comment"
        className="block text-sm font-medium text-gray-200"
      >
        SSH Private Key
      </label>
      <div className="mt-1 code">
        <textarea
          value={value}
          rows={4}
          name="sshPrivateKey"
          className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-500 text-white bg-transparent rounded-md"
          onChange={onChange}
        />
      </div>
    </div>
  );
}

export default function ProjectSettings() {
  const { data, mutate } = useSWR("/projects/credentials", fetcher);

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <Formik
          enableReinitialize
          initialValues={{
            accessToken: data?.accessToken || "",
            sshPrivateKey: data?.sshPrivateKey || "",
            sshKeyFingerprint: data?.sshKeyFingerprint || "",
            sshPassphrase: data?.sshPassphrase || "",
          }}
          onSubmit={async (
            { accessToken, sshPrivateKey, sshKeyFingerprint, sshPassphrase },
            { setSubmitting, resetForm }
          ) => {
            setSubmitting(true);
            try {
              const accessTokenUpdated = accessToken !== data?.accessToken;
              const sshPrivateKeyUpdated =
                sshPrivateKey !== data?.sshPrivateKey;
              const sshKeyFingerprintUpdated =
                sshKeyFingerprint !== data?.sshKeyFingerprint;
              const sshPassphraseUpdated =
                sshPassphrase !== data?.sshPassphrase;
              await postData("/projects/credentials", {
                ...(accessTokenUpdated && { accessToken }),
                ...(sshPrivateKeyUpdated && { sshPrivateKey }),
                ...(sshKeyFingerprintUpdated && { sshKeyFingerprint }),
                ...(sshPassphraseUpdated && { sshPassphrase }),
              });
              await mutate();
              resetForm();
              toast.success("Credentials updated");
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
            dirty,
            resetForm,
          }) => (
            <form
              onSubmit={handleSubmit}
              className="space-y-8 divide-y divide-gray-400 bg-gray-700 px-10 py-10 rounded-md shadow"
            >
              <div className="space-y-8 divide-y divide-gray-200">
                <div>
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-white">
                      DigitalOcean credentials
                    </h3>
                  </div>
                  <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <TextField
                      className="sm:col-span-6 code"
                      value={values.accessToken}
                      handleChange={handleChange}
                      label="Personal Access Token"
                      name="accessToken"
                      type="password"
                    />
                    <TextField
                      className="sm:col-span-6 code"
                      value={values.sshKeyFingerprint}
                      handleChange={handleChange}
                      label="SSH Key Fingerprint"
                      name="sshKeyFingerprint"
                      type="text"
                    />
                    <TextField
                      className="sm:col-span-6 code"
                      value={values.sshPassphrase}
                      handleChange={handleChange}
                      label="SSH Key Passphrase"
                      name="sshPassphrase"
                      type="password"
                      optional
                    />
                    <SSHPrivateKeyInput
                      value={values.sshPrivateKey}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-5">
                <div className="flex justify-end">
                  {!isSubmitting && dirty && (
                    <Button text="Cancel" white onClick={() => resetForm()} />
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting || !dirty}
                    className="ml-3 inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {isSubmitting && <Spinner className="mr-2" />}
                    Save
                  </button>
                </div>
              </div>
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
}
