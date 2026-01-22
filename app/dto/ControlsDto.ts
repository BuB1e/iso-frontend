import { ControlStatus } from "../types";

export interface ControlResponseDto {
	id: number;
	code: string;
	name: string;
	currentPractice: string;
	description: string;
	guidance: string;
	status:	 ControlStatus;
	assessmentControlId: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateControlDto {
	code: string;
	name: string;
	currentPractice: string;
	description: string;
	guidance: string;
	assessmentControlId: number;
	status:	 ControlStatus;
}

export interface UpdateControlDto {
	id: number;
	code?: string;
	name?: string;
	currentPractice?: string;
	description?: string;
	guidance?: string;
	assessmentControlId?: number;
	status?: ControlStatus;
}
