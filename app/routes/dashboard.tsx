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
import { Link } from "react-router";
import { DashboardCard } from "~/components/ui/card";
import {
  ControlItem,
  createMockControl,
  createMockAssessmentControl,
} from "~/components/ui/controlItem";
import { StatusBadge } from "~/components/ui/statusBadge";
import { PageHeader, SectionHeader } from "~/components/ui/pageHeader";
import {
  ControlStatus,
  ControlsType,
  type TControl,
  type TAssessmentControl,
  UserRole,
} from "~/types";
import { useUserStore } from "~/stores/userStore";

// Mock high-risk controls
function getHighRiskControls(): {
  control: TControl;
  assessmentControl: TAssessmentControl;
}[] {
  return [
    {
      control: createMockControl(
        "A.8.23",
        "Web filtering",
        "Access to external websites should be managed to reduce exposure to malicious content",
        ControlStatus.NOT_IMPLEMENTED,
        1,
      ),
      assessmentControl: createMockAssessmentControl(
        ControlsType.TECHNOLOGICAL,
      ),
    },
    {
      control: createMockControl(
        "A.8.24",
        "Use of cryptography",
        "Rules for the effective use of cryptography should be defined and implemented",
        ControlStatus.NOT_IMPLEMENTED,
        1,
      ),
      assessmentControl: createMockAssessmentControl(
        ControlsType.TECHNOLOGICAL,
      ),
    },
    {
      control: createMockControl(
        "A.5.15",
        "Access control",
        "Rules to control physical and logical access to information should be established",
        ControlStatus.NOT_IMPLEMENTED,
        1,
      ),
      assessmentControl: createMockAssessmentControl(ControlsType.ORGANIZATION),
    },
  ];
}

export default function Dashboard() {
  const currentUser = useUserStore((state) => state.currentUser);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  // Render different dashboards based on role
  switch (currentUser.role) {
    case UserRole.ADMIN:
      return <AdminDashboard />;
    case UserRole.EXTERNAL_EXPERT:
      return <ExternalExpertDashboard />;
    case UserRole.INTERNAL_EXPERT:
    default:
      return <InternalExpertDashboard />;
  }
}

// ============ ADMIN DASHBOARD ============
function AdminDashboard() {
  const mockStats = {
    totalCompanies: 4,
    totalUsers: 12,
    totalAssessments: 8,
    pendingReviews: 15,
  };

  const recentActivity = [
    { user: "John Doe", action: "Updated control A.5.1", time: "2 hours ago" },
    {
      user: "Jane Smith",
      action: "Approved control A.6.2",
      time: "4 hours ago",
    },
    { user: "Bob Wilson", action: "Uploaded evidence", time: "Yesterday" },
  ];

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
          value={mockStats.totalCompanies}
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={mockStats.totalUsers}
          color="green"
        />
        <StatCard
          icon={FileText}
          label="Assessments"
          value={mockStats.totalAssessments}
          color="purple"
        />
        <StatCard
          icon={Clock}
          label="Pending Reviews"
          value={mockStats.pendingReviews}
          color="yellow"
        />
      </div>

      {/* Quick Links & Activity */}
      <div className="grid grid-cols-2 gap-6">
        {/* Quick Links */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <SectionHeader title="Quick Actions" />
          <div className="grid grid-cols-2 gap-3 mt-4">
            <QuickLink to="/admin/users" icon={Users} label="Manage Users" />
            <QuickLink
              to="/admin/companies"
              icon={Building2}
              label="Manage Companies"
            />
            <QuickLink to="/audit" icon={FileText} label="View Audit Logs" />
            <QuickLink
              to="/report"
              icon={TrendingUp}
              label="Generate Reports"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <SectionHeader title="Recent Activity" />
          <div className="flex flex-col gap-3 mt-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
              >
                <div>
                  <span className="font-medium text-slate-800">
                    {activity.user}
                  </span>
                  <span className="text-slate-500 text-sm">
                    {" "}
                    {activity.action}
                  </span>
                </div>
                <span className="text-xs text-slate-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* High Risk Controls */}
      <HighRiskControlList controls={getHighRiskControls()} />
    </div>
  );
}

// ============ INTERNAL EXPERT DASHBOARD ============
function InternalExpertDashboard() {
  const highRiskControls = getHighRiskControls();
  const stats = {
    totalControls: 93,
    implemented: 12,
    partial: 28,
    notImplemented: 53,
  };
  const compliancePercentage = Math.round(
    (stats.implemented / stats.totalControls) * 100,
  );

  return (
    <div className="flex flex-col min-h-screen py-8 px-8 lg:px-16 bg-slate-50/50 gap-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your ISO 27001 compliance status and key metrics"
        icon={LayoutDashboard}
      />

      {/* Stats Cards */}
      <div className="flex justify-between gap-4 w-full">
        <DashboardCard
          topic="Overall Compliance"
          description={`${compliancePercentage}% of controls are fully implemented`}
          Icon={CheckCircle}
        />
        <DashboardCard
          topic="Controls Assessed"
          description={`${stats.implemented + stats.partial} of ${stats.totalControls} controls reviewed`}
          Icon={LayoutDashboard}
        />
        <DashboardCard
          topic="Needs Attention"
          description={`${stats.notImplemented} controls require implementation`}
          Icon={AlertCircle}
        />
      </div>

      {/* High Risk Controls */}
      <HighRiskControlList controls={highRiskControls} />
    </div>
  );
}

// ============ EXTERNAL EXPERT DASHBOARD ============
function ExternalExpertDashboard() {
  const assignedCompanies = [
    {
      id: 1,
      name: "Acme Corp",
      pendingReviews: 5,
      lastReview: "2 days ago",
      progress: 65,
    },
    {
      id: 2,
      name: "TechStart Inc",
      pendingReviews: 12,
      lastReview: "1 week ago",
      progress: 35,
    },
    {
      id: 3,
      name: "SecureData Ltd",
      pendingReviews: 3,
      lastReview: "Yesterday",
      progress: 78,
    },
  ];

  const recentReviews = [
    {
      control: "A.5.1",
      company: "Acme Corp",
      status: "approved",
      date: "Yesterday",
    },
    {
      control: "A.6.2",
      company: "SecureData Ltd",
      status: "approved",
      date: "2 days ago",
    },
    {
      control: "A.8.5",
      company: "TechStart Inc",
      status: "rejected",
      date: "3 days ago",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen py-8 px-8 lg:px-16 bg-slate-50/50 gap-6">
      <PageHeader
        title="Reviewer Dashboard"
        description="Manage your assigned companies and pending reviews"
        icon={Star}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={Building2}
          label="Assigned Companies"
          value={assignedCompanies.length}
          color="blue"
        />
        <StatCard
          icon={Clock}
          label="Pending Reviews"
          value={assignedCompanies.reduce(
            (acc, c) => acc + c.pendingReviews,
            0,
          )}
          color="yellow"
        />
        <StatCard
          icon={CheckCircle}
          label="Completed This Month"
          value={15}
          color="green"
        />
      </div>

      {/* Assigned Companies */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <SectionHeader title="Assigned Companies" />
        <div className="grid grid-cols-3 gap-4 mt-4">
          {assignedCompanies.map((company) => (
            <Link
              key={company.id}
              to="/assessment/overview"
              className="p-4 border border-slate-200 rounded-xl hover:shadow-lg hover:border-main-blue/50 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800">{company.name}</h3>
                {company.pendingReviews > 0 && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                    {company.pendingReviews} pending
                  </span>
                )}
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Progress</span>
                  <span className="font-medium text-slate-700">
                    {company.progress}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-main-blue rounded-full"
                    style={{ width: `${company.progress}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Last review: {company.lastReview}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <SectionHeader title="Recent Reviews" />
        <div className="flex flex-col gap-3 mt-4">
          {recentReviews.map((review, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
            >
              <div className="flex items-center gap-4">
                <span className="px-2 py-1 bg-slate-100 text-slate-700 font-mono text-sm rounded">
                  {review.control}
                </span>
                <span className="text-slate-600">{review.company}</span>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge
                  label={review.status === "approved" ? "Approved" : "Rejected"}
                  variant={review.status === "approved" ? "success" : "error"}
                />
                <span className="text-xs text-slate-400">{review.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
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
  return (
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
        <Link
          to="/assessment/overview"
          className="flex items-center gap-1 text-sm text-main-blue hover:underline"
        >
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Controls List */}
      <div className="flex flex-col justify-between items-start h-fit w-full gap-3">
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
  );
}
