import {
  LayoutDashboard,
  TriangleAlert,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Building2,
  Users,
  FileText,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react";
import { Link, useLoaderData } from "react-router";
import { useEffect, useState } from "react";
import { DashboardCard } from "~/components/ui/card";
import { ControlItem } from "~/components/ui/controlItem";
import { PageHeader, SectionHeader } from "~/components/ui/pageHeader";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "~/components/ui/modal";
import {
  ControlStatus,
  type TControl,
  type TAssessmentControl,
  UserRole,
} from "~/types";
import { useUserStore } from "~/stores/userStore";
import { useAdminStore } from "~/stores/adminStore";
import { useYearStore } from "~/stores/yearStore";
import {
  CompanyService,
  UserService,
  IsoAssessmentService,
  ControlService,
  AssessmentControlService,
} from "~/services";
import {
  DonutChart,
  DonutLegend,
  DomainProgress,
} from "~/components/ui/charts";

// Helper to calculate compliance stats
function calculateStats(controls: TControl[]) {
  const total = controls.length;
  const implemented = controls.filter(
    (c) => c.status === ControlStatus.IMPLEMENTED,
  ).length;
  const partial = controls.filter(
    (c) => c.status === ControlStatus.PARTIALLY,
  ).length;
  const notImplemented = controls.filter(
    (c) => c.status === ControlStatus.NOT_IMPLEMENTED,
  ).length;
  return { total, implemented, partial, notImplemented };
}

// Helper to calculate per-domain stats
function calculateDomainStats(
  controls: TControl[],
  assessmentControls: TAssessmentControl[],
) {
  // Domain configuration
  const domainConfig = [
    { code: "A.5", name: "Organizational", color: "#3b82f6" },
    { code: "A.6", name: "People", color: "#10b981" },
    { code: "A.7", name: "Physical", color: "#f59e0b" },
    { code: "A.8", name: "Technological", color: "#8b5cf6" },
  ];

  return domainConfig.map((domain) => {
    // Find controls matching this domain code
    const domainControls = controls.filter((c) =>
      c.code.startsWith(domain.code),
    );
    const implemented = domainControls.filter(
      (c) => c.status === ControlStatus.IMPLEMENTED,
    ).length;
    const total = domainControls.length;

    return {
      ...domain,
      implemented,
      total,
    };
  });
}

// Loader - fetch all data for dashboards
export async function loader() {
  const [companies, users, isoAssessments, controls, assessmentControls] =
    await Promise.all([
      CompanyService.getAllCompany(),
      UserService.getAllUser(),
      IsoAssessmentService.getAllIsoAssessment(),
      ControlService.getAllControl(),
      AssessmentControlService.getAllAssessmentControl(),
    ]);

  return {
    companies,
    users: users || [],
    isoAssessments,
    controls,
    assessmentControls,
  };
}

export default function Dashboard() {
  const { companies, users, isoAssessments, controls, assessmentControls } =
    useLoaderData<typeof loader>();
  const currentUser = useUserStore((state) => state.currentUser);
  const { currentYear, setAllYears } = useYearStore();
  const { selectedCompanyId } = useAdminStore();

  // Populate available years in store
  useEffect(() => {
    if (isoAssessments.length > 0) {
      const years = Array.from(new Set(isoAssessments.map((a) => a.year))).sort(
        (a, b) => b - a,
      );
      setAllYears(years);
    }
  }, [isoAssessments, setAllYears]);

  // Set page title
  useEffect(() => {
    document.title = "Dashboard | ISO Portal";
    return () => {
      document.title = "ISO Portal";
    };
  }, []);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  // Filter data by current year
  // Filter data by current year AND user's company
  // Determine effective company filter
  const targetCompanyId =
    currentUser.role === UserRole.ADMIN
      ? selectedCompanyId
      : currentUser.companyId;

  // Filter assessments based on target context
  const filteredAssessments = isoAssessments.filter((a) => {
    // 1. Always filter by year
    if (a.year !== currentYear) return false;

    // If no target company (Global Admin View), show all
    if (!targetCompanyId) return true;

    // Otherwise, filter by specific company
    return a.companyId === targetCompanyId;
  });
  const filteredAssessmentIds = filteredAssessments.map((a) => a.id);

  // Filter downstream data (for Internal Dashboard)
  // 1. Get assessment controls linked to filtered assessments
  const filteredAssessmentControls = assessmentControls.filter((ac) =>
    filteredAssessmentIds.includes(ac.isoAssessmentId),
  );
  const filteredAssessmentControlIds = filteredAssessmentControls.map(
    (ac) => ac.id,
  );

  // 2. Get controls linked to filtered assessment controls
  const filteredControls = controls.filter((c) =>
    filteredAssessmentControlIds.includes(c.assessmentControlId),
  );

  // Render different dashboards based on role
  // 1. Admin Hybrid View
  if (currentUser.role === UserRole.ADMIN) {
    if (!selectedCompanyId) {
      // Global View
      return (
        <AdminDashboard
          companies={companies}
          users={users}
          isoAssessments={filteredAssessments}
        />
      );
    }

    // Hybrid View (Selected Company)
    const detailProps = {
      controls: filteredControls,
      assessmentControls:
        filteredAssessmentControls as unknown as TAssessmentControl[],
    };

    return (
      <AdminDashboard
        companies={companies}
        users={users}
        isoAssessments={isoAssessments}
        detailProps={detailProps}
      />
    );
  }

  // 2. Unassigned Non-Admin User (Safety Check)
  if (!currentUser.companyId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-800">
            Account Pending Assignment
          </h1>
          <p className="text-slate-500">
            Please contact your administrator to be assigned to a company.
          </p>
        </div>
      </div>
    );
  }

  // 3. Regular Internal Expert
  if (currentUser.role === UserRole.INTERNAL_EXPERT) {
    return (
      <InternalExpertDashboard
        controls={filteredControls}
        assessmentControls={
          filteredAssessmentControls as unknown as TAssessmentControl[]
        }
      />
    );
  }

  // 4. External Expert
  if (currentUser.role === UserRole.EXTERNAL_EXPERT) {
    return (
      <ExternalExpertDashboard
        companies={companies}
        isoAssessments={isoAssessments}
        controls={controls}
        assessmentControls={
          assessmentControls as unknown as TAssessmentControl[]
        }
      />
    );
  }

  return <div className="p-8">Unknown Role Config</div>;
}

// ============ ADMIN DASHBOARD ============
function AdminDashboard({
  companies,
  users,
  isoAssessments,
  detailProps,
}: any) {
  const stats = {
    totalCompanies: companies.length,
    totalUsers: users.length,
    totalAssessments: isoAssessments.length,
    pendingReviews: 0, // No review service yet
  };

  return (
    <div className="flex flex-col min-h-screen py-8 px-8 lg:px-16 bg-slate-50/50 gap-6">
      <PageHeader
        title="Admin Dashboard"
        description="System overview and management"
        icon={LayoutDashboard}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          label="Total Companies"
          value={stats.totalCompanies}
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
          color="green"
        />
        <StatCard
          icon={FileText}
          label="Assessments"
          value={stats.totalAssessments}
          color="purple"
        />
        <StatCard
          icon={Clock}
          label="Pending Reviews"
          value={stats.pendingReviews}
          color="yellow"
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 col-span-2">
          <SectionHeader title="Quick Actions" />
          <div className="grid grid-cols-3 gap-3 mt-4">
            <QuickLink to="/admin/users" icon={Users} label="Manage Users" />
            <QuickLink
              to="/admin/companies"
              icon={Building2}
              label="Manage Companies"
            />
            <QuickLink to="/summary" icon={TrendingUp} label="View summary" />
          </div>
        </div>
      </div>

      {/* Selected Company Details */}
      {detailProps && (
        <div className="mt-8 border-t border-slate-200 pt-8">
          <SectionHeader title="Selected Company Overview" />
          <div className="-mx-8">
            <InternalExpertDashboard {...detailProps} hideHeader />
          </div>
        </div>
      )}
    </div>
  );
}

// ============ INTERNAL EXPERT DASHBOARD ============
function InternalExpertDashboard({
  controls,
  assessmentControls,
  hideHeader = false,
}: {
  controls: TControl[];
  assessmentControls: TAssessmentControl[];
  hideHeader?: boolean;
}) {
  const stats = calculateStats(controls);
  const domainStats = calculateDomainStats(controls, assessmentControls);
  const compliancePercentage =
    stats.total > 0 ? Math.round((stats.implemented / stats.total) * 100) : 0;

  // Donut chart data
  const donutSegments = [
    { value: stats.implemented, color: "#10b981", label: "Implemented" },
    { value: stats.partial, color: "#f59e0b", label: "Partially" },
    { value: stats.notImplemented, color: "#ef4444", label: "Not Implemented" },
  ];

  // Filter high risk (not implemented)
  const highRiskList = controls
    .filter((c) => c.status === ControlStatus.NOT_IMPLEMENTED)
    // Passed full list to component which handles slicing
    .map((control) => {
      // Find matching assessment control (domain)
      const assessmentControl = assessmentControls.find(
        (a) => a.id === control.assessmentControlId,
      );
      // Fallback if not found (should not happen with real data)
      const safeAssessmentControl =
        assessmentControl ||
        ({
          id: 0,
          count: 0,
          maxCount: 0,
          type: "ORGANIZATION", // Default to prevent type errors
          assessmentId: 0,
          description: "Unknown Domain",
        } as unknown as TAssessmentControl);

      return { control, assessmentControl: safeAssessmentControl };
    });

  return (
    <div
      className={`flex flex-col ${!hideHeader ? "min-h-screen py-8 px-8 lg:px-16" : "py-4 px-8"} bg-slate-50/50 gap-6`}
    >
      {!hideHeader && (
        <PageHeader
          title="Dashboard"
          description="Overview of your ISO 27001 compliance status and key metrics"
          icon={LayoutDashboard}
        />
      )}

      {/* Stats Cards */}
      <div className="flex justify-between gap-4 w-full">
        <DashboardCard
          topic="Overall Compliance"
          description={`${compliancePercentage}% of controls are fully implemented`}
          Icon={CheckCircle}
        />
        <DashboardCard
          topic="Controls Assessed"
          description={`${stats.implemented + stats.partial} of ${stats.total} controls reviewed`}
          Icon={LayoutDashboard}
        />
        <DashboardCard
          topic="Needs Attention"
          description={`${stats.notImplemented} controls require implementation`}
          Icon={AlertCircle}
        />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Compliance Donut Chart */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Compliance Breakdown
          </h3>
          <div className="flex items-center justify-between">
            <DonutChart
              segments={donutSegments}
              centerLabel="Compliant"
              size={160}
              strokeWidth={20}
              animated
            />
            <DonutLegend items={donutSegments} />
          </div>
        </div>

        {/* Domain Progress */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Domain Compliance
          </h3>
          <DomainProgress domains={domainStats} animated />
        </div>
      </div>

      {/* High Risk Controls */}
      {highRiskList.length > 0 ? (
        <HighRiskControlList controls={highRiskList} />
      ) : (
        <div className="p-6 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500 text-center">
            No high risk controls found for this year.
          </p>
        </div>
      )}
    </div>
  );
}

// ============ EXTERNAL EXPERT DASHBOARD ============
function ExternalExpertDashboard({
  companies,
  isoAssessments,
  controls,
  assessmentControls,
}: {
  companies: any[];
  isoAssessments: any[];
  controls: TControl[];
  assessmentControls: any[];
}) {
  const currentUser = useUserStore((state) => state.currentUser);
  const { currentYear } = useYearStore();

  // External Expert sees only their assigned company
  const assignedCompanyId = currentUser?.companyId;
  const assignedCompany = companies.find((c) => c.id === assignedCompanyId);

  // If no company assigned, show empty state
  if (!assignedCompany) {
    return (
      <div className="flex flex-col min-h-screen py-8 px-8 lg:px-16 bg-slate-50/50 gap-6">
        <PageHeader
          title="Reviewer Dashboard"
          description="View your assigned company's compliance status"
          icon={Star}
        />
        <div className="bg-white rounded-xl p-12 border border-slate-200 text-center">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            No Company Assigned
          </h3>
          <p className="text-slate-500 max-w-md mx-auto">
            You have not been assigned to a company yet. Please contact your
            administrator to be assigned to a company for review.
          </p>
        </div>
      </div>
    );
  }

  // Filter data for assigned company only
  // 1. Find assessments for this company in current year
  const companyAssessments = isoAssessments.filter(
    (a) => a.companyId === assignedCompanyId && a.year === currentYear,
  );
  const assessmentIds = companyAssessments.map((a) => a.id);

  // 2. Find assessment controls
  const companyAssessmentControls = assessmentControls.filter((ac) =>
    assessmentIds.includes(ac.isoAssessmentId),
  );
  const assessmentControlIds = companyAssessmentControls.map((ac) => ac.id);

  // 3. Get controls for this company
  const companyControls = controls.filter((c) =>
    assessmentControlIds.includes(c.assessmentControlId),
  );

  // 4. Show same dashboard as Internal Expert
  return (
    <div className="flex flex-col min-h-screen py-8 px-8 lg:px-16 bg-slate-50/50 gap-6">
      <PageHeader
        title={`${assignedCompany.name} - Compliance Dashboard`}
        description={`Reviewing ${currentYear} ISO 27001 compliance status`}
        icon={Star}
      />

      {/* Reuse Internal Expert Dashboard content */}
      <InternalExpertDashboard
        controls={companyControls}
        assessmentControls={
          companyAssessmentControls as unknown as TAssessmentControl[]
        }
        hideHeader={true}
      />
    </div>
  );
}

// ============ REUSABLE COMPONENTS ============

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: "blue" | "green" | "purple" | "yellow";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    yellow: "bg-yellow-50 text-yellow-600",
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function QuickLink({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-main-blue/5 hover:border-main-blue/50 transition-colors"
    >
      <Icon className="w-5 h-5 text-main-blue" />
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </Link>
  );
}

function HighRiskControlList({
  controls,
}: {
  controls: { control: TControl; assessmentControl: TAssessmentControl }[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const displayControls = controls.slice(0, 3); // Show top 3 in summary

  return (
    <>
      <div className="flex flex-col justify-start items-start h-fit w-full py-6 px-6 rounded-lg border-2 bg-main-gray border-alert-red-bg shadow-xl">
        {/* Header */}
        <div className="flex flex-row items-center justify-between gap-4 mb-4 w-full">
          <div className="flex flex-row items-center gap-4">
            <div className="flex flex-row items-center p-2 rounded-lg bg-alert-red-bg">
              <TriangleAlert className="w-8 h-8 text-alert-red" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                High Risk Controls
              </h2>
              <p className="text-sm text-slate-500">
                Controls that require immediate attention
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 text-sm text-main-blue hover:underline"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Controls List (Top 3) */}
        <div className="flex flex-col justify-between items-start h-fit w-full gap-3">
          {displayControls.map(({ control, assessmentControl }) => (
            <ControlItem
              key={control.code}
              control={control}
              assessmentControl={assessmentControl}
              isHighRisk={true}
            />
          ))}
        </div>
      </div>

      {/* Full List Modal */}
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <ModalContent size="xl" className="max-h-[80vh] flex flex-col">
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2 text-alert-red">
              <TriangleAlert className="w-5 h-5" />
              All High Risk Controls ({controls.length})
            </ModalTitle>
            <ModalDescription>
              Complete list of controls that are not yet implemented.
            </ModalDescription>
          </ModalHeader>

          <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-[300px] p-4">
            <div className="flex flex-col gap-3">
              {controls.map(({ control, assessmentControl }) => (
                <ControlItem
                  key={control.code}
                  control={control}
                  assessmentControl={assessmentControl}
                  isHighRisk={true}
                />
              ))}
            </div>
          </div>

          <ModalFooter>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
