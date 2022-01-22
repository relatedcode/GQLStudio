import useAuth from "hooks/useAuth";
import { useRouter } from "next/router";
import LoadingScreen from "components/LoadingScreen";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();

  if (!isInitialized) return <LoadingScreen />;

  if (!isAuthenticated) router.push("/authentication/login");

  return <>{children}</>;
}
