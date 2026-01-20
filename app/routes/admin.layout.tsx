import { Outlet, Navigate } from "react-router";
import { useUserStore } from "~/stores/userStore";
import { UserRole } from "~/types";

/**
 * Admin layout - protects admin routes from non-admin users
 */
export default function AdminLayout() {
  const currentUser = useUserStore((state) => state.currentUser);

  // Redirect non-admin users to dashboard
  if (!currentUser || currentUser.role !== UserRole.ADMIN) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
