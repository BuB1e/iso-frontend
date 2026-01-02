import { Outlet } from "react-router";

export default function Assessment() {


	return(
		<div className="flex flex-col h-screen justify-center items-center bg-light-brown">
			<h1 className="text-8xl text-main-brown">{}</h1>
			<Outlet />
		</div>
	);
}
