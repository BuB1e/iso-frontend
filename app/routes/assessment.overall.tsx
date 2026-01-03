import { Domains } from "~/types";
import { DomainCard } from "~/components/ui/card";

export default function AssessmentOverall() {
	return(
		<div className="flex flex-col w-full h-full justify-center items-center gap-4">
			{Object.values(Domains).map((domain) => (
				<DomainCard key={domain.number} domain={domain}/>
			))}
		</div>
	);
}
