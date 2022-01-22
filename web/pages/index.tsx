import LoadingScreen from "components/LoadingScreen";
import useAuth from "hooks/useAuth";
import router from "next/router";

export default function Main() {
  const { user, isInitialized } = useAuth();

  if (!isInitialized) return <LoadingScreen />;

  if (user) router.push("/dashboard");

  if (!user) router.push("/authentication/login");

  return <></>;
}
