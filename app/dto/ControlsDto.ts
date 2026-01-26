import { ControlStatus } from "../types";

export interface ControlResponseDto {
	id: number;
	code: string;
	name: string;
	currentPractice: string;
	description: string;
	userContext?: string | null;
	evidenceDescription?: string | null;
	guidance: string;
	assessmentControlId: number;
	status:	 ControlStatus;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateControlDto {
	code: string;
	name: string;
	description: string;
	guidance: string;
	assessmentControlId: number;
	status?: ControlStatus;
	currentPractice?: string;
	userContext?: string;
	evidenceDescription?: string;
}

export interface UpdateControlDto {
	id: number;
	currentPractice?: string;
	assessmentControlId?: number;
	userContext?: string;
	evidenceDescription?: string;
	status?: ControlStatus;
}
