import { Outlet } from "react-router";
import Sidebar from "../components/layouts/sidebar";
import { useState } from "react";
import Topbar from "~/components/layouts/topbar";

export default function Layout() {
	return(
		<div className="flex flex-row h-screen overflow-hidden">
			<Sidebar />

			{/* Main Content */}
			<div className="w-full">
				<div className="sticky top-0">
					<Topbar />
				</div>
				<Outlet />
			</div>
		</div>
	);
}
