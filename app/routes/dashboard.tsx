import { LayoutDashboard, TriangleAlert, ChevronRight } from "lucide-react";
import { DashboardCard } from "~/components/ui/card";
import { ControlItem } from "~/components/ui/controlItem";
import { EControlItemType } from "~/types";

export default function Dashboard() {
	return(
		<div className="
			flex flex-col min-h-screen py-10 lg:px-30
			justify-start items-start bg-light-brown scroll-auto"
		>
			<h1 className="text-4xl font-bold text-main-blue">Dashboard</h1>
			<CardGrid />
			<HighRiskControlList />
		</div>
	);
}

function CardGrid() {
	return(
		<div className="flex justify-between gap-4 w-full py-8">
			<DashboardCard topic="Topic" description="Description" Icon={LayoutDashboard} />
			<DashboardCard topic="Topic" description="Description" Icon={LayoutDashboard} />
			<DashboardCard topic="Topic" description="Description" Icon={LayoutDashboard} />
		</div>
	);
}

function HighRiskControlList() {
	return(
		<div className="
			flex flex-col justify-start items-start h-fit w-full py-8 px-4
			rounded-lg border-2 bg-main-gray border-alert-red-bg shadow-xl"
		>
			{/* Topic */}
			<div className="flex flex-row items-center justify-between gap-4">
				<div className="flex flex-row items-center p-2 rounded-lg bg-alert-red-bg">
					<TriangleAlert className="w-8 h-8 text-alert-red" />
				</div>
				<div>
					<h2 className="text-xl font-bold">High Risk Controls</h2>
					<p className="text-sm">Controls that require immediate attention</p>
				</div>
			</div>

			{/* Controls */}
			{/* TODO: fetch real high risk controls data */}
			<div className="flex flex-col justify-between items-start h-fit w-full py-8 px-4 gap-2">
				<ControlItem type={EControlItemType.HighRisk} control="A.8.23" description="Web filtering" assessmentStatus="Not implemented" />
				<ControlItem type={EControlItemType.HighRisk} control="A.8.23" description="Web filtering" assessmentStatus="Not implemented" />
				<ControlItem type={EControlItemType.HighRisk} control="A.8.23" description="Web filtering" assessmentStatus="Not implemented" />
				<ControlItem type={EControlItemType.HighRisk} control="A.8.23" description="Web filtering" assessmentStatus="Not implemented" />
			</div>
		</div>
	);
}


function Overall() {
	return(
		<div>
			<h2>Overall</h2>
		</div>
	);
}
