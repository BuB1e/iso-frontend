import { Outlet, useNavigate, useLocation } from "react-router";
import { useEffect } from "react";
import { authClient } from "~/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useUserStore } from "~/stores/userStore";
import { UserService } from "~/services/UserService";

export default function ProtectedLayout() {
  const { data: session, isPending, error } = authClient.useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  useEffect(() => {
    if (!isPending && !session) {
      if (location.pathname !== "/login") {
        navigate("/login");
      }
    }
  }, [session, isPending, navigate, location]);

  // Sync session with user store
  useEffect(() => {
    if (session?.user) {
      // Fetch full user details from our API to get role/company
      // Or assume session user has these if configured in BetterAuth
      // For now, we fetch from our API to match TUser
      // Assuming session.user.id matches our DB ID or email
      UserService.getAllUser().then((users) => {
        const match = (users || []).find((u) => u.email === session.user.email);
        if (match) {
          setCurrentUser(match);
        }
      });
    }
  }, [session, setCurrentUser]);

  if (isPending) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-main-blue" />
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return <Outlet />;
}
