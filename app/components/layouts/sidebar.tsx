import { useState } from "react";
import { PanelRightOpen, PanelLeftOpen, LayoutDashboard, Settings, File, FileText, ShieldCheck, LogOut, ClipboardList} from "lucide-react";
import { Link } from "react-router";

export default function Sidebar() {
	const [isOpen, setIsOpen] = useState<boolean>(true);

	return(
		<div className={`
			bg-main-brown ${isOpen ? "w-[20%]" : "w-[5%]"}
			transition-all duration-300 ease-in-out
			min-h-screen overflow-hidden py-8 px-6
		`}>
			<SidebarOpenButton isOpen={isOpen} setIsOpen={setIsOpen}/>
			<Avatar isOpen={isOpen}/>
			<SidebarItems isOpen={isOpen}/>
			<SignOut isOpen={isOpen}/>
		</div>
	)
}

function SidebarOpenButton({isOpen, setIsOpen}: {isOpen: boolean, setIsOpen: (isOpen: boolean) => void}) {
	return(
		<div className="flex justify-end">
			{
				isOpen ?
				<PanelRightOpen className={`${isOpen ? "w-[20%]" : "w-full"} text-main-blue`} onClick={() => setIsOpen(!isOpen)}/>
				:
				<PanelLeftOpen className={`${isOpen ? "w-[20%]" : "w-full"} text-main-blue`} onClick={() => setIsOpen(!isOpen)}/>
			}
		</div>
	);
}

function Avatar({isOpen}: {isOpen: boolean}) {
	return(
		<div className="w-full border-b-2 border-secondary-brown pb-4">
			{isOpen && (
				<div className="flex items-center justify-center gap-4">
					<img
						src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4YreOWfDX3kK-QLAbAL4ufCPc84ol2MA8Xg&s"
						alt="mock_avatar"
						className="w-12 h-12 rounded-full"
					/>
					<div className="flex flex-col text-main-blue">
						<span>John Doe</span>
						<span>Admin</span>
					</div>
				</div>
			)}
		</div>
	);
}

function SignOut({isOpen} : {isOpen: boolean}) {
	return(
		<div className="p-4">
			{isOpen && (
				<Link to="/login" className="flex flex-row justify-center gap-4 p-4 text-main-blue bg-secondary-brown rounded-md hover:bg-main-grey transition-colors duration-150">
					<LogOut/>
					Sign Out
				</Link>
			)}
		</div>
	)
}

function SidebarItems({isOpen} : {isOpen: boolean}) {

	const items = [
		{
			title: "Dashboard",
			url: "dashboard",
			icon: LayoutDashboard,
		},
		{
			title: "Assessment",
			url: "assessment",
			icon: ShieldCheck,
		},
		{
			title: "Evidence",
			url: "evidence",
			icon: File,
		},
		{
			title: "Report",
			url: "report",
			icon: ClipboardList,
		},
		{
			title: "Audit",
			url: "audit",
			icon: FileText,
		},
		{
			title: "Settings",
			url: "settings",
			icon: Settings,
		},
	]

	return(
		isOpen ?
		<div className="flex flex-col h-[80%] justify-start gap-4 p-4 border-b-2 border-secondary-brown pb-4">
			{items.map((item, index) => (
				<Link
					to={item.url}
					key={index}
					className="flex flex-col items-center gap-4 text-main-blue bg-secondary-brown p-2 rounded-md hover:bg-main-grey transition-colors duration-150"
				>
					<div className="flex items-center gap-4 text-main-blue">
						<item.icon />
						<span>{item.title}</span>
					</div>
				</Link>
			))}
		</div>
		:
		<div></div>
	);
}
