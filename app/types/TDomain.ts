import { Shield, Users, Lock, Server, type LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

export interface TDomain {
	number: number;
	name: string;
	description: string;
	icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
	color: string;
}

export const Domains: Record<string, TDomain> = {
	A5: {
		number: 5,
		name: "Organizational Controls",
		description: "Policies, roles, responsibilities and asset management",
		icon: Shield,
		color: "main-blue",
	},
	A6: {
		number: 6,
		name: "People Controls",
		description: "HR security, awareness and training",
		icon: Users,
		color: "main-blue",
	},
	A7: {
		number: 7,
		name: "Physical Controls",
		description: "Access control, physical security and asset protection",
		icon: Lock,
		color: "main-blue",
	},
	A8: {
		number: 8,
		name: "Technical Controls",
		description: "Access control, cryptography, data protection, operations and network security",
		icon: Server,
		color: "main-blue",
	},
};
