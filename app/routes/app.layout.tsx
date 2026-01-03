import { Outlet } from "react-router";
import Sidebar from "../components/layouts/sidebar";
import { useState } from "react";
import Topbar from "~/components/layouts/topbar";

export default function Layout() {
	return(
		<div className="flex flex-row h-screen overflow-hidden">
			<Sidebar />

			{/* Main Content */}
			<div className="flex flex-col w-full h-screen overflow-hidden">
				<Topbar />
				<div className="flex-1 overflow-y-auto ">
					<Outlet />
				</div>
			</div>
		</div>
	);
}
