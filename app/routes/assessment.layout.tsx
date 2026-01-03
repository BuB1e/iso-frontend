import { Outlet } from "react-router";
import { useYearStore } from "~/stores/yearStore";

export default function Assessment() {
	const currentYear = useYearStore((state) => state.currentYear);

	return(
		<div className="
			flex flex-col min-h-screen py-10 lg:px-30
			justify-start items-start bg-light-brown scroll-auto gap-4"
		>
			<h1 className="text-4xl text-main-blue font-bold">ISO27001 Assessment Compliance on year : {currentYear}</h1>
			<Outlet />
		</div>
	);
}
