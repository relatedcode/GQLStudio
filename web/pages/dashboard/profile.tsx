import { updateUser } from "gqlite-lib/dist/client/auth";
import { getFileURL, uploadFile } from "gqlite-lib/dist/client/storage";
import { now } from "gqlite-lib/dist/client/utils";
import Button from "components/Button";
import Spinner from "components/Spinner";
import TextField from "components/TextField";
import { Formik } from "formik";
import useAuth from "hooks/useAuth";
import useUser from "hooks/useUser";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { postData } from "utils/api-helpers";

function EditPassword() {
  const { user } = useAuth();

  return (
    <div className="pt-0 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <Formik
          enableReinitialize
          initialValues={{
            newPassword: "",
            newPasswordConfirm: "",
          }}
          onSubmit={async ({ newPassword }, { setSubmitting, resetForm }) => {
            setSubmitting(true);
            try {
              await updateUser(user.uid, { password: newPassword });
              resetForm();
              toast.success("Profile updated");
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
                      Edit password
                    </h3>
                  </div>
                  <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <TextField
                      className="sm:col-span-3"
                      value={values.newPassword}
                      handleChange={handleChange}
                      autoComplete="new-password"
                      required
                      label="New password"
                      name="newPassword"
                      type="password"
                    />
                    <TextField
                      className="sm:col-span-3"
                      value={values.newPasswordConfirm}
                      handleChange={handleChange}
                      autoComplete="new-password"
                      required
                      label="New password confirm"
                      name="newPasswordConfirm"
                      type="password"
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
                    disabled={
                      isSubmitting ||
                      !dirty ||
                      values.newPassword !== values.newPasswordConfirm
                    }
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

export default function Profile() {
  const { user } = useUser();

  const [photo, setPhoto] = useState<any>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const fileRef = useRef<any>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (photo) setPhotoUrl(URL.createObjectURL(photo));
    else {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
      setPhotoUrl("");
    }
  }, [photo]);

  const handleSavePicture = async () => {
    try {
      const photoURL = await uploadFile(
        "gqlstudio",
        `User/${user.objectId}-${now()}`,
        photo
      );
      return photoURL;
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeletePicture = async () => {
    setLoading(true);
    try {
      await postData(`/users/${user.objectId}`, {
        photoURL: "",
      });
      setPhoto(null);
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  return (
    <>
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <Formik
            enableReinitialize
            initialValues={{
              email: user?.email || "",
              name: user?.name || "",
            }}
            onSubmit={async ({ email, name }, { setSubmitting, resetForm }) => {
              setSubmitting(true);
              try {
                const emailEdited = email !== user?.email;
                const nameEdited = name !== user?.name;
                if (emailEdited || nameEdited || photoUrl) {
                  await postData(`/users/${user?.objectId}`, {
                    ...(emailEdited && { email }),
                    ...(nameEdited && { name }),
                    ...(photoUrl && { photoURL: await handleSavePicture() }),
                  });
                }
                setPhoto(null);
                resetForm();
                toast.success("Profile updated");
              } catch (err: any) {
                if (err.code === "auth/user-token-expired")
                  toast.success(
                    "Updated successfully. You need to reauthenticate when you update your email address."
                  );
                else toast.error(err.message);
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
                        Personal Information
                      </h3>
                      <p className="mt-1 text-sm text-gray-200">
                        Use a permanent address where you can receive mail.
                      </p>
                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-6">
                        <input
                          ref={fileRef}
                          hidden
                          type="file"
                          accept="image/*"
                          onChange={(e) => setPhoto(e.target.files?.item(0))}
                        />
                        <label
                          htmlFor="photo"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Photo
                        </label>
                        <div className="mt-1 flex items-center space-x-3">
                          {!photoUrl && !user?.photoURL && (
                            <span className="h-16 w-16 rounded-full overflow-hidden bg-gray-100">
                              <svg
                                className="h-full w-full text-gray-300"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            </span>
                          )}
                          {(photoUrl || user?.photoURL) && (
                            <div
                              className="h-16 w-16 rounded-full bg-cover"
                              style={{
                                backgroundImage: `url(${
                                  photoUrl || getFileURL(user?.photoURL)
                                })`,
                              }}
                            />
                          )}

                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => fileRef?.current?.click()}
                            className="bg-gray-700 flex items-center py-2 px-3 border border-gray-400 rounded-md shadow-sm text-sm leading-4 font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ring-offset-gray-600 disabled:opacity-50"
                          >
                            {loading && <Spinner className="mr-2" />}
                            Upload an image
                          </button>

                          {user?.photoURL && (
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => handleDeletePicture()}
                              className="bg-gray-700 flex items-center py-2 px-3 border border-gray-400 rounded-md shadow-sm text-sm leading-4 font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ring-offset-gray-600 disabled:opacity-50"
                            >
                              {loading && <Spinner className="mr-2" />}
                              Remove photo
                            </button>
                          )}
                        </div>
                      </div>

                      <TextField
                        className="sm:col-span-3"
                        value={values.name}
                        handleChange={handleChange}
                        required
                        label="Name"
                        name="name"
                        type="text"
                      />

                      <TextField
                        className="sm:col-span-3"
                        value={values.email}
                        handleChange={handleChange}
                        required
                        label="Email address"
                        name="email"
                        type="email"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-5">
                  <div className="flex justify-end">
                    {!isSubmitting && (dirty || photo) && (
                      <Button
                        text="Cancel"
                        white
                        onClick={() => {
                          resetForm();
                          setPhoto(null);
                        }}
                      />
                    )}
                    <button
                      type="submit"
                      disabled={isSubmitting || (!dirty && !photoUrl)}
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
      <EditPassword />
    </>
  );
}
