import { ChevronRight } from "lucide-react";
import { Link, useParams } from "react-router";
import {
  type TControl,
  type TAssessmentControl,
  ControlStatus,
  ControlsType,
  controlStatusConfig,
  controlsTypeColorMap,
  type DomainColorKey,
} from "~/types";
import { useYearStore } from "~/stores/yearStore";
import { useUserStore } from "~/stores/userStore";
import { useAdminStore } from "~/stores/adminStore";
import { UserRole } from "~/types";

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
      className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${config.bgColor} ${config.color}`}
    >
      {config.label}
    </span>
  );
}

/**
 * High-risk control item - displayed on dashboard for controls needing attention
 */
function HighRiskControlItem({ control }: HighRiskControlItemProps) {
  const { currentYear } = useYearStore();
  const currentUser = useUserStore((state) => state.currentUser);
  const { selectedCompanyId } = useAdminStore();
  
  const targetCompanyId =
    currentUser?.role === UserRole.ADMIN
      ? selectedCompanyId
      : currentUser?.companyId;

  const searchParams = new URLSearchParams();
  if (currentYear) searchParams.set("year", String(currentYear));
  if (targetCompanyId) searchParams.set("companyId", String(targetCompanyId));
  const queryString = searchParams.toString();

  return (
    <Link
      to={`/assessment/domain/A${control.code.split(".")[1]?.split(".")[0] || "5"}/${control.code}${queryString ? `?${queryString}` : ""}`}
      className="
        flex flex-row justify-between items-center h-fit w-full py-3 px-4
        rounded-lg border bg-white border-alert-red-bg shadow-sm
        hover:scale-[1.02] transition-all duration-75 hover:shadow-md cursor-pointer"
    >
      {/* Control Info */}
      <div className="flex flex-row items-center gap-4 flex-1 min-w-0">
        <div className="flex items-center justify-center p-2 w-fit rounded-lg bg-alert-red-bg shrink-0">
          <span className="text-sm font-bold text-alert-red">
            {control.code}
          </span>
        </div>
        <div className="flex flex-col min-w-0">
          <h2 className="text-lg font-bold text-slate-800 truncate">
            {control.name}
          </h2>
          <p className="text-sm text-slate-500 truncate max-w-full">
            {control.description}
          </p>
        </div>
      </div>

      {/* Status & Action */}
      <div className="flex items-center gap-4 shrink-0 pl-4">
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

  // Map string types from API to DomainColorKey
  const typeColorMap: Record<string, DomainColorKey> = {
    ORGANIZATION: "blue",
    PEOPLE: "green",
    PHYSICAL: "yellow",
    TECHNOLOGICAL: "purple",
  };

  // Use string lookup if domainType is string, otherwise use enum lookup
  const colorKey =
    typeof domainType === "string"
      ? typeColorMap[domainType] || "blue"
      : controlsTypeColorMap[domainType];

  const colors = colorStyles[colorKey];

  const { currentYear } = useYearStore();
  const currentUser = useUserStore((state) => state.currentUser);
  const { selectedCompanyId } = useAdminStore();

  const targetCompanyId =
    currentUser?.role === UserRole.ADMIN
      ? selectedCompanyId
      : currentUser?.companyId;

  const searchParams = new URLSearchParams();
  if (currentYear) searchParams.set("year", String(currentYear));
  if (targetCompanyId) searchParams.set("companyId", String(targetCompanyId));
  const queryString = searchParams.toString();

  return (
    <Link
      to={`/assessment/domain/${domainNumber}/${control.code}${queryString ? `?${queryString}` : ""}`}
      className={`
        flex flex-row justify-between items-center h-fit w-full py-3 px-4
        rounded-lg border shadow-sm
        hover:scale-[1.02] transition-all duration-75 hover:shadow-md cursor-pointer
        bg-linear-to-br from-white ${colors.gradient}
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
