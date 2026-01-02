import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { LucideProps } from "lucide-react";

interface CardProps {
	topic: String,
	description: String,
	Icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>
}

export default function DashboardCard({topic, description, Icon}: CardProps) {
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
