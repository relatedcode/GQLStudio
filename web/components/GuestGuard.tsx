import useAuth from "hooks/useAuth";
import { useRouter } from "next/router";
import LoadingScreen from "./LoadingScreen";

export default function GuestGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isInitialized } = useAuth();
  const router = useRouter();

  if (!isInitialized) return <LoadingScreen />;

  if (user) router.push("/dashboard");

  return <>{children}</>;
}
