import { ChevronRight } from "lucide-react";
import { EControlItemType, type ColorKey, type TDomain } from "~/types";

interface ControlItemProps {
	type: EControlItemType;
	domain?: TDomain;
	control: string;
	description: string;
	assessmentStatus?: string;
}

interface HighRiskControlItemProps {
	control: string;
	assessmentStatus: string | undefined;
	description: string;
}

interface AssessmentControlItemProps {
	domain: TDomain | undefined,
	control: string;
	assessmentStatus: string | undefined;
	description: string;
}

const colorStyles: Record<
  ColorKey,
  { bg: string; text: string; gradient: string; border: string }
> = {
  "main-blue": {
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

export function ControlItem({ type, domain, control, assessmentStatus, description }: ControlItemProps) {
	if (type == EControlItemType.HighRisk) {
		return <HighRiskControlItem control={control} assessmentStatus={assessmentStatus} description={description} />;
	} else if (type == EControlItemType.AssessmentItem) {
		return <AssessmentControlItem domain={domain} control={control} assessmentStatus={assessmentStatus} description={description} />;
	}
}

function HighRiskControlItem({ control, assessmentStatus, description }: HighRiskControlItemProps) {
	return(
		<div className="
			flex flex-row justify-between items-center h-fit w-full py-2 px-4
			rounded-lg border bg-white border-alert-red-bg shadow-sm
			hover:scale-102 transition-all duration-75 "
		>
			{/* Topic */}
			{/* TODO: implement real data on high risk control items */}
			<div className="flex flex-row items-center gap-4">
				<div className="flex items-center justify-center p-2 w-fit rounded-lg bg-alert-red-bg">
					<h2 className="text-sm font-bold text-alert-red">{control}</h2>
				</div>
				<div>
					<h2 className="text-lg font-bold">{description}</h2>
					<p className="text-sm truncate">{assessmentStatus || "Unknown Status"}</p>
				</div>
			</div>

			{/* Actions */}
			<ChevronRight className="w-6 h-6 text-alert-red" />
		</div>
	);
}


function AssessmentControlItem({ domain, control, assessmentStatus, description }: AssessmentControlItemProps) {
	const colors = colorStyles[domain?.color || "main-blue"];

	return(
		<div className={`
			flex flex-row justify-between items-center h-fit w-full py-2 px-4
			rounded-lg border shadow-sm
			hover:scale-102 transition-all duration-75
			bg-linear-to-br from-white ${colors.gradient}
			border ${colors.border}
		`}
		>
			{/* Topic */}
			{/* TODO: implement real data on high risk control items */}
			<div className="flex flex-row items-center gap-4">
				<div className={`flex items-center justify-center p-2 w-fit rounded-lg ${colors.bg}`}>
					<h2 className={`text-sm font-bold ${colors.text}`}>{control}</h2>
				</div>
				<div>
					<h2 className="text-lg font-bold">{description}</h2>
					<p className="text-sm truncate p-2">{assessmentStatus || "Unknown Status"}</p>
				</div>
			</div>

			{/* Actions */}
			<ChevronRight className={`w-6 h-6 ${colors.text}`} />
		</div>
	);
}
