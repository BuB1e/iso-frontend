import { Outlet, useNavigate, useLocation, useLoaderData } from "react-router";
import Sidebar from "../components/layouts/sidebar";
import { useState, useEffect } from "react";
import Topbar from "~/components/layouts/topbar";
import { useUserStore } from "~/stores/userStore";
import { UserRole } from "~/types";
import { IsoAssessmentService } from "~/services";
import { useYearStore } from "~/stores/yearStore";
import { useAdminStore } from "~/stores/adminStore";

export async function loader() {
  const assessments = await IsoAssessmentService.getAllIsoAssessment();
  return { assessments };
}

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useUserStore((state) => state.currentUser);
  const { assessments } = useLoaderData<typeof loader>();
  const { setAllYears, currentYear, setCurrentYear } = useYearStore();

  const { selectedCompanyId } = useAdminStore();

  // Populate years store on mount / when assessments change / when company filter changes
  useEffect(() => {
    if (assessments && assessments.length > 0) {
      // Determine the target company ID to filter by
      const targetCompanyId =
        currentUser?.role === UserRole.ADMIN
          ? selectedCompanyId
          : currentUser?.companyId;

      // Filter assessments if a company is targeted
      const filteredAssessments = targetCompanyId
        ? assessments.filter((a) => a.companyId === targetCompanyId)
        : assessments; // Admins with no selection see all years

      // Extract unique years from filtered assessments
      const uniqueYears = Array.from(
        new Set(filteredAssessments.map((a) => a.year)),
      ).sort((a, b) => a - b); // Ascending sort

      setAllYears(uniqueYears);

      // Validate currentYear against new list
      // If currentYear is NOT in the new list, switch to the latest year
      if (uniqueYears.length > 0 && !uniqueYears.includes(currentYear)) {
        const latestYear = uniqueYears[uniqueYears.length - 1];
        setCurrentYear(latestYear);
      }
    } else {
      setAllYears([]);
    }
  }, [
    assessments,
    currentUser,
    selectedCompanyId,
    setAllYears,
    currentYear,
    setCurrentYear,
  ]);

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
