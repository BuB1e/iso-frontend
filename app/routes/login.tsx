import { Link } from "react-router";

export default function Login() {
	return (
		<div className="flex h-screen items-center justify-center bg-light-brown">
			<Link to="/dashboard" className="bg-main-brown rounded-4xl text-main-grey text-6xl p-16">
				Login
			</Link>
		</div>
	)
}
