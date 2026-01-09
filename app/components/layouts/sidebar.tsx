import { PanelRightOpen, PanelLeftOpen, LayoutDashboard, Settings, File, FileText, ShieldCheck, LogOut, ClipboardList} from "lucide-react";
import { Link } from "react-router";
import { useSidebarStore } from "~/stores"
import { ESidebarPage } from "~/types"

interface SidebarItemsProps {
	isOpen: boolean;
	style: {text: string, icon: string, button: string};
	currentPage: ESidebarPage;
	setCurrentPage: (currentPage: ESidebarPage) => void;
}

export default function Sidebar() {
	const { isOpen, currentPage, toggleOpen, setCurrentPage } = useSidebarStore()
	const style = {
		text: "text-main-blue font-bold lg:text-lg text-sm truncate",
		icon: "lg:w-5 lg:h-5 w-4 h-4 font-bold",
		button: "rounded-md hover:bg-main-gray shadow-lg transition-colors duration-150"
	}

	return(
		<div className={`
			bg-linear-to-r from-main-brown to-secondary-brown
			border-r border-main-brown
			${isOpen ? "w-[15%]" : "w-[6%]"}
			transition-all duration-300 ease-in-out
			h-screen overflow-hidden py-8 px-6
			sticky top-0 z-50
		`}>
			<SidebarOpenButton isOpen={isOpen} setIsOpen={toggleOpen} style={style}/>
			<Avatar isOpen={isOpen}/>
			<SidebarItems isOpen={isOpen} style={style} currentPage={currentPage} setCurrentPage={setCurrentPage}/>
			<SignOut isOpen={isOpen} style={style}/>
		</div>
	)
}

function SidebarOpenButton({isOpen, setIsOpen, style}: {isOpen: boolean, setIsOpen: (isOpen: boolean) => void, style: {text: string, icon: string}}) {
	return(
		<div className="flex justify-end pb-4">
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
			{/*{isOpen && (*/}
				<div className="flex items-center justify-center gap-4">
					<img
						src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4YreOWfDX3kK-QLAbAL4ufCPc84ol2MA8Xg&s"
						alt="mock_avatar"
						className="w-12 h-12 rounded-full"
					/>
					<div className={`flex flex-col text-main-blue ${!isOpen && "hidden"}`}>
						<span>John Doe</span>
						<span>Admin</span>
					</div>
				</div>
			{/*)}*/}
		</div>
	);
}

function SignOut({isOpen, style} : {isOpen: boolean, style: {text: string, icon: string, button: string}}) {
	return(
		<div className="py-4">
			<Link to="/login"
				className=
				{
					`flex flex-row ${!isOpen ? "w-fit p-4" : "p-2"} justify-center items-center gap-4
					${style.text} ${style.button} bg-light-brown`
				}
			>
				<LogOut className={style.icon} />
				<span className={`${!isOpen && "hidden"}`}>Sign Out</span>
			</Link>
		</div>
	)
}

function SidebarItems({isOpen, style, currentPage, setCurrentPage} : SidebarItemsProps) {

	const items = [
		{
			title: "Dashboard",
			url: ESidebarPage.Dashboard,
			icon: LayoutDashboard,
		},
		{
			title: "Assessment",
			url: ESidebarPage.Assessment,
			icon: ShieldCheck,
		},
		{
			title: "Evidence",
			url: ESidebarPage.Evidence,
			icon: File,
		},
		{
			title: "Report",
			url: ESidebarPage.Report,
			icon: ClipboardList,
		},
		{
			title: "Audit",
			url: ESidebarPage.Audit,
			icon: FileText,
		},
		//{
		//	title: "Settings",
		//	url: ESidebarPage.Settings,
		//	icon: Settings,
		//},
	]

	return(

		<div className={`flex flex-col h-[80%] justify-start gap-4 py-4 border-b-2 border-secondary-brown pb-4`}>
			{items.map((item, index) => (
				<Link
					to={item.url}
					key={index}
					className={`flex flex-col ${!isOpen ? "w-fit p-4" : "p-2"} gap-4 ${style.button} ${currentPage == item.url ? "bg-main-gray scale-105" : "bg-secondary-brown/70"}`}
					onClick={() => setCurrentPage(item.url)}
				>
					<div className={`flex items-center lg:justify-start justify-center gap-4 ${style.text}`}>
						<item.icon className={style.icon} />
						<span className={`hidden ${isOpen && "lg:inline"}`}>{item.title}</span>
					</div>
				</Link>
			))}
		</div>

	);
}
