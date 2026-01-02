import { ChevronRight } from "lucide-react";
import { EControlItemType } from "~/types";

interface ControlItemProps {
	type: EControlItemType;
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
	control: string;
	description: string;
}

export function ControlItem({ type, control, assessmentStatus, description }: ControlItemProps) {
	if (type == EControlItemType.HighRisk) {
		return <HighRiskControlItem control={control} assessmentStatus={assessmentStatus} description={description} />;
	} else if (type == EControlItemType.AssessmentItem) {
		return <AssessmentControlItem control={control} description={description} />;
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

function AssessmentControlItem({ control, description }: AssessmentControlItemProps) {
	return(
		<div className="flex flex-row items-center gap-4">
			<div className="flex items-center justify-center p-2 w-fit rounded-lg bg-alert-red-bg">
				<h2 className="text-sm font-bold text-alert-red">A.8.23</h2>
			</div>
			<div>
				<h2 className="text-lg font-bold">Web filtering</h2>
				<p className="text-sm truncate">Not implemented</p>
			</div>
		</div>
	);
}
