import { Outlet } from "react-router";
import Sidebar from "../components/layouts/sidebar";
import { useState } from "react";

export default function Layout() {
	return(
		<div className="flex flex-row min-h-screen">
			<Sidebar />
			{/* Main Content */}
			<div className="flex-1">
				<Outlet />
			</div>

		</div>
	);
}
