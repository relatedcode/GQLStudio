import LoadingScreen from "components/LoadingScreen";
import useAuth from "hooks/useAuth";
import Head from "next/head";
import React, { useEffect } from "react";

export default function Logout() {
  const { logout } = useAuth();
  useEffect(() => {
    (async () => {
      await logout();
      window.location.replace("/authentication/login");
    })();
  }, []);

  return (
    <>
      <Head>
        <title>Logout</title>
      </Head>
      <LoadingScreen />
    </>
  );
}
