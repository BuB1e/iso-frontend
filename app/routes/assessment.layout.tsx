import { Outlet } from "react-router";
import { useYearStore } from "~/stores/yearStore";

export default function Assessment() {
	const currentYear = useYearStore((state) => state.currentYear);

	return(
		<div className="
			flex flex-col min-h-screen py-8 px-8 lg:px-16
			justify-start items-start bg-slate-50/50 scroll-auto gap-4"
		>
			<div>
				<h1 className="text-2xl text-slate-800 font-bold">ISO27001 Assessment Compliance on year : {currentYear}</h1>
				<p className="text-slate-500 text-sm mt-1">
					Track and evaluate your organization's compliance with ISO 27001 security controls.
				</p>
			</div>
			<Outlet />
		</div>
	);
}
