import type { ForwardRefExoticComponent, RefAttributes } from "react";
import { ChevronRight, type LucideProps } from "lucide-react";
import type { TDomain } from "~/types/TDomain";

interface DashboardCardProps {
	topic: String,
	description: String,
	Icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>
}

interface DomainCardProps {
	domain: TDomain,
}

export function DashboardCard({topic, description, Icon}: DashboardCardProps) {
	return(
		<div
			className="
			flex flex-col text-white py-10 px-10 justify-start
			w-full lg:h-[200px] h-[180px] gap-4 rounded-xl shadow-xl
			bg-linear-to-br from-main-blue to-secondary-blue
			hover:scale-105 transition-all duration-75 hover:"
		>
			<div className="flex flex-row items-center justify-between gap-4">
				<h2 className="text-2xl font-bold">{topic}</h2>
				<Icon className="w-8 h-8" />
			</div>
			<p className="text-sm">{description}</p>
		</div>
	);
}

export function DomainCard({domain}: DomainCardProps) {
	return(
		<div className={`group
			flex flex-col bg-white rounded-xl shadow-xl w-full lg:h-[200px] h-[180px]
			hover:scale-101 transition-all duration-75 hover:shadow-2xl`}
		>
			<div className={`flex flex-row items-center justify-between`}>
				<div className="flex flex-row items-center w-fit">
					<domain.icon className="w-12 h-12" />
					<div className="flex flex-col">
						<div className="flex flex-row items-center">
							<div className={`rounded-sm bg-${domain.color} p-1`}>
								<span className="text-sm font-bold text-white">A.{domain.number}</span>
							</div>
							<h2 className="text-2xl font-bold">{domain.name}</h2>
						</div>
						<p className="text-sm">{domain.description}</p>
					</div>
				</div>
				<ChevronRight className="w-8 h-8 text-gray-500 group-hover:text-main-blue transition-colors"/>
			</div>
		</div>
	);
}
