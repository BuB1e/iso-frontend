import { Outlet, useNavigate, useLocation } from "react-router";
import Sidebar from "../components/layouts/sidebar";
import { useState, useEffect } from "react";
import Topbar from "~/components/layouts/topbar";
import { useUserStore } from "~/stores/userStore";
import { UserRole } from "~/types";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useUserStore((state) => state.currentUser);

  useEffect(() => {
    // If user is loaded, not admin, and has no company => restrict access
    if (
      currentUser &&
      currentUser.role !== UserRole.ADMIN &&
      !currentUser.companyId
    ) {
      const allowedPaths = ["/dashboard", "/settings"];
      // Check if current path is allowed (exact match or subpath)
      // e.g. /dashboard/xyz is allowed (if it existed), /settings is allowed.
      // But /assessment is NOT.
      const isAllowed = allowedPaths.some((path) =>
        location.pathname.startsWith(path),
      );

      if (!isAllowed) {
        navigate("/dashboard");
      }
    }
  }, [currentUser, location.pathname, navigate]);

  return (
    <div className="flex flex-row h-screen overflow-hidden print:block print:h-auto print:overflow-visible">
      <div className="print:hidden">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-col w-full h-screen overflow-hidden print:h-auto print:overflow-visible print:block">
        <div className="print:hidden">
          <Topbar />
        </div>
        <div className="flex-1 overflow-y-auto print:overflow-visible print:h-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
