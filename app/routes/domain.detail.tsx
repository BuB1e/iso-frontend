import { Domains } from "~/types";
import { useParams } from "react-router";
import { EControlItemType } from "~/types";
import { ControlItem } from "~/components/ui/controlItem";


//export function ControlItem({ type, control, assessmentStatus, description }: ControlItemProps) {

const mock = [
	{
		type: EControlItemType.AssessmentItem,
		control: "A.5.1",
		assessmentStatus: "Not implemented",
		description: "mock description"
	},
	{
		type: EControlItemType.AssessmentItem,
		control: "A.5.2",
		assessmentStatus: "Not implemented",
		description: "mock description"
	},
	{
		type: EControlItemType.AssessmentItem,
		control: "A.5.3",
		assessmentStatus: "Not implemented",
		description: "mock description"
	},
	{
		type: EControlItemType.AssessmentItem,
		control: "A.5.4",
		assessmentStatus: "Not implemented",
		description: "mock description"
	},
	{
		type: EControlItemType.AssessmentItem,
		control: "A.5.5",
		assessmentStatus: "Not implemented",
		description: "mock description"
	},
	{
		type: EControlItemType.AssessmentItem,
		control: "A.5.6",
		assessmentStatus: "Not implemented",
		description: "mock description"
	},
	{
		type: EControlItemType.AssessmentItem,
		control: "A.5.7",
		assessmentStatus: "Not implemented",
		description: "mock description"
	},
	{
		type: EControlItemType.AssessmentItem,
		control: "A.5.8",
		assessmentStatus: "Not implemented",
		description: "mock description"
	},
]

export default function DomainDetail() {
	const { domainNumber } = useParams();
	const domain = Domains[domainNumber as keyof typeof Domains];

	return(
		<div className="flex flex-col gap-2 w-full">
			{/* Header */}
			<div>
				<h1 className="text-xl font-bold">A.{domain.number} - {domain.name}</h1>
				<p className="text-slate-500 text-sm mt-1">
					{domain.description}
				</p>
			</div>

			{/* Content */}
			<div className="flex flex-col gap-4 w-full">
				{mock.map((item, index) => (
					<ControlItem key={index} type={item.type} domain={domain} control={item.control} assessmentStatus={item.assessmentStatus} description={item.description} />
				))}
			</div>
		</div>
	);
}
