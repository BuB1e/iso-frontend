import { Calendar } from "lucide-react"
import { TopbarYearCombobox } from "~/components/ui/combobox"

export default function Topbar() {
	const style = {
		text: "text-main-blue font-bold lg:text-xl text-lg truncate",
		icon: "lg:w-5 lg:h-5 w-4 h-4 text-main-blue",
	}

	return(
		<div className="
			flex flex-row justify-start items-center px-6
			bg-secondary-brown min-w-full lg:h-20 h-16 border-b border-main-brown
			sticky top-0 z-50"
		>
			<div className="flex flex-row items-center gap-2">
				<Calendar className={style.icon} />
				<span className={style.text}>Assessment Year:</span>
				<TopbarYearCombobox />
			</div>
		</div>
	)
}
