import AuthButton from "components/AuthButton";
import AuthField from "components/AuthField";
import GuestGuard from "components/GuestGuard";
import { FAKE_EMAIL, getAPIUrl } from "config";
import { Formik } from "formik";
import useAuth from "hooks/useAuth";
import Link from "next/link";
import React from "react";
import toast from "react-hot-toast";

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

function Signup() {
  const { login } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img className="mx-auto h-20 w-auto rounded" src="/logo.png" alt="" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-200">
            Or{" "}
            <Link href="/authentication/login">
              <a className="font-medium text-green-500">sign in</a>
            </Link>
          </p>
        </div>
        <Formik
          initialValues={{
            name: "",
            email: "",
            password: "",
          }}
          onSubmit={async ({ email, password, name }, { setSubmitting }) => {
            setSubmitting(true);
            try {
              let emailPayload = email;
              let passwordPayload = password;
              if (FAKE_EMAIL && !email.includes("@") && !password) {
                emailPayload = `${email}@${email}.com`;
                passwordPayload = `${email}111`;
              }

              const res = await fetch(`${getAPIUrl()}/users`, {
                method: "post",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: name,
                  email: emailPayload,
                  password: passwordPayload,
                }),
              });

              if (!res.ok) {
                const e = await res.json();
                const error = new Error(e.error.message);
                throw error;
              }

              await login(emailPayload, passwordPayload);
            } catch (err: any) {
              toast.error(err.message);
            }
            setSubmitting(false);
          }}
        >
          {({
            values,
            handleChange,
            handleSubmit,
            setFieldValue,
            isSubmitting,
          }) => (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm -space-y-px">
                <AuthField
                  label="Name"
                  placeholder="Name"
                  name="name"
                  required
                  type="text"
                  className="rounded-t-md"
                  handleChange={(e: any) =>
                    setFieldValue("name", capitalize(e.target.value))
                  }
                  value={values.name}
                  autoComplete="name"
                />
                <AuthField
                  label="Email"
                  placeholder="Email address"
                  name="email"
                  required
                  type={FAKE_EMAIL ? "text" : "email"}
                  handleChange={handleChange}
                  value={values.email}
                  autoComplete="email"
                />
                <AuthField
                  label="Password"
                  placeholder="Password"
                  name="password"
                  className="rounded-b-md"
                  required={!FAKE_EMAIL}
                  type="password"
                  handleChange={handleChange}
                  value={values.password}
                  autoComplete="new-password"
                />
              </div>

              <AuthButton text="Sign up" loading={isSubmitting} />
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default function Main() {
  return (
    <GuestGuard>
      <Signup />
    </GuestGuard>
  );
}
