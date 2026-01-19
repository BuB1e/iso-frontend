import {
  LayoutDashboard,
  TriangleAlert,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { DashboardCard } from "~/components/ui/card";
import {
  ControlItem,
  createMockControl,
  createMockAssessmentControl,
} from "~/components/ui/controlItem";
import {
  ControlStatus,
  ControlsType,
  type TControl,
  type TAssessmentControl,
} from "~/types";
import { Link } from "react-router";

// TODO: Fetch from API - Get high-risk controls (NOT_IMPLEMENTED status)
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
    {
      control: createMockControl(
        "A.6.3",
        "Information security awareness",
        "All personnel should receive appropriate awareness training",
        ControlStatus.NOT_IMPLEMENTED,
        1,
      ),
      assessmentControl: createMockAssessmentControl(ControlsType.PEOPLE),
    },
  ];
}

export default function Dashboard() {
  // TODO: Fetch from API
  const highRiskControls = getHighRiskControls();

  return (
    <div
      className="
			flex flex-col min-h-screen py-8 px-8 lg:px-16
			justify-start items-start bg-slate-50/50 scroll-auto gap-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Overview of your ISO 27001 compliance status and key metrics.
        </p>
      </div>
      <CardGrid />
      <HighRiskControlList controls={highRiskControls} />
    </div>
  );
}

function CardGrid() {
  // TODO: Fetch real stats from API
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
    <div className="flex justify-between gap-4 w-full py-4">
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
  );
}

interface HighRiskControlListProps {
  controls: { control: TControl; assessmentControl: TAssessmentControl }[];
}

function HighRiskControlList({ controls }: HighRiskControlListProps) {
  return (
    <div
      className="
			flex flex-col justify-start items-start h-fit w-full py-6 px-6
			rounded-lg border-2 bg-main-gray border-alert-red-bg shadow-xl"
    >
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-4 mb-4">
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
