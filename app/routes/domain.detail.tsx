import { useParams } from "react-router";

export default function DomainDetail() {
	const { domainNumber } = useParams();

	return(
		<div>
			<h1>Domain Detail {domainNumber}</h1>
		</div>
	);
}
