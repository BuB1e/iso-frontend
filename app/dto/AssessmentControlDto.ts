import { ControlsType } from "../types";

// This is Domains (4 Domains)
export interface AssessmentControlResponseDto {
	id: number;
	assessmentId: number;
	count: number;
	maxCount: number;
	description: string;
	type: ControlsType;
	createdAt: Date;
	updatedAt: Date;
}
