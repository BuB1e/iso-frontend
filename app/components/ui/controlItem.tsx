import { ChevronRight } from "lucide-react";
import { Link, useParams } from "react-router";
import {
  type TControl,
  type TAssessmentControl,
  ControlStatus,
  ControlsType,
  controlStatusConfig,
  controlsTypeColorMap,
  controlsTypeDomainMap,
  type DomainColorKey,
} from "~/types";

// Props for the main ControlItem component
interface ControlItemProps {
  control: TControl;
  assessmentControl: TAssessmentControl;
  isHighRisk?: boolean;
}

// Props for the high-risk variant
interface HighRiskControlItemProps {
  control: TControl;
}

// Props for the assessment control variant
interface AssessmentControlItemProps {
  control: TControl;
  domainType: ControlsType;
}

// Color styles for each domain type
const colorStyles: Record<
  DomainColorKey,
  { bg: string; text: string; gradient: string; border: string }
> = {
  blue: {
    bg: "bg-main-blue/20",
    text: "text-main-blue",
    gradient: "to-main-blue/30",
    border: "border-main-blue",
  },
  green: {
    bg: "bg-green-400/20",
    text: "text-green-800",
    gradient: "to-green-400/30",
    border: "border-green-600",
  },
  yellow: {
    bg: "bg-yellow-400/20",
    text: "text-yellow-800",
    gradient: "to-yellow-400/30",
    border: "border-yellow-600",
  },
  purple: {
    bg: "bg-purple-400/20",
    text: "text-purple-800",
    gradient: "to-purple-400/30",
    border: "border-purple-600",
  },
};

/**
 * Main ControlItem component that renders either HighRisk or Assessment variant
 */
export function ControlItem({
  control,
  assessmentControl,
  isHighRisk = false,
}: ControlItemProps) {
  if (isHighRisk) {
    return <HighRiskControlItem control={control} />;
  }
  return (
    <AssessmentControlItem
      control={control}
      domainType={assessmentControl.type}
    />
  );
}

/**
 * Status badge component showing the control's implementation status
 */
function StatusBadge({ status }: { status: ControlStatus }) {
  const config = controlStatusConfig[status];
  return (
    <span
      className={`px-2 py-1 rounded-md text-xs font-medium ${config.bgColor} ${config.color}`}
    >
      {config.label}
    </span>
  );
}

/**
 * High-risk control item - displayed on dashboard for controls needing attention
 */
function HighRiskControlItem({ control }: HighRiskControlItemProps) {
  return (
    <Link
      to={`/assessment/domain/A${control.code.split(".")[1]?.split(".")[0] || "5"}/${control.code}`}
      className="
        flex flex-row justify-between items-center h-fit w-full py-3 px-4
        rounded-lg border bg-white border-alert-red-bg shadow-sm
        hover:scale-[1.02] transition-all duration-75 hover:shadow-md cursor-pointer"
    >
      {/* Control Info */}
      <div className="flex flex-row items-center gap-4">
        <div className="flex items-center justify-center p-2 w-fit rounded-lg bg-alert-red-bg">
          <span className="text-sm font-bold text-alert-red">
            {control.code}
          </span>
        </div>
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-slate-800">{control.name}</h2>
          <p className="text-sm text-slate-500 truncate max-w-md">
            {control.description}
          </p>
        </div>
      </div>

      {/* Status & Action */}
      <div className="flex items-center gap-4">
        <StatusBadge status={control.status} />
        <ChevronRight className="w-6 h-6 text-alert-red" />
      </div>
    </Link>
  );
}

/**
 * Assessment control item - displayed in domain detail view
 */
function AssessmentControlItem({
  control,
  domainType,
}: AssessmentControlItemProps) {
  const { domainNumber } = useParams();
  const colorKey = controlsTypeColorMap[domainType];
  const colors = colorStyles[colorKey];

  return (
    <Link
      to={`/assessment/domain/${domainNumber}/${control.code}`}
      className={`
        flex flex-row justify-between items-center h-fit w-full py-3 px-4
        rounded-lg border shadow-sm
        hover:scale-[1.02] transition-all duration-75 hover:shadow-md cursor-pointer
        bg-gradient-to-br from-white ${colors.gradient}
        ${colors.border}`}
    >
      {/* Control Info */}
      <div className="flex flex-row items-center gap-4">
        <div
          className={`flex items-center justify-center p-2 w-fit rounded-lg ${colors.bg}`}
        >
          <span className={`text-sm font-bold ${colors.text}`}>
            {control.code}
          </span>
        </div>
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-slate-800">{control.name}</h2>
          <p className="text-sm text-slate-500 truncate max-w-md">
            {control.description}
          </p>
        </div>
      </div>

      {/* Status & Action */}
      <div className="flex items-center gap-4">
        <StatusBadge status={control.status} />
        <ChevronRight className={`w-6 h-6 ${colors.text}`} />
      </div>
    </Link>
  );
}

/**
 * Utility function to create a mock control for testing
 * TODO: Remove this when connected to API
 */
export function createMockControl(
  code: string,
  name: string,
  description: string,
  status: ControlStatus = ControlStatus.NOT_IMPLEMENTED,
	guidance: string,
  assessmentControlId: number = 1,
): TControl {
  return {
    id: Math.random() * 1000,
    code,
    name,
    currentPractice: "",
    description,
    status,
	  guidance,
    assessmentControlId,
  };
}

/**
 * Utility function to create a mock assessment control for testing
 * TODO: Remove this when connected to API
 */
export function createMockAssessmentControl(
  type: ControlsType,
  count: number = 0,
  maxCount: number = 10,
): TAssessmentControl {
  return {
    id: Math.random() * 1000,
    count,
    maxCount,
    description: "",
    type,
    assessmentId: 1,
  };
}
