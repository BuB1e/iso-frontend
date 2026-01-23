import { ControlsType } from "../types";

// This is Domains (4 Domains)
export interface AssessmentControlEntity {
	id: number;
	assessmentId: number;
	description: string;
	type: ControlsType;
	createdAt: Date;
	updatedAt: Date;
}
