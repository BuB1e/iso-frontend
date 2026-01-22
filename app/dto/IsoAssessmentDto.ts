import { iso_status } from "../types";

export interface IsoAssessmentResponseDto {
	id: number;
	name: string;
	year: number;
	status: iso_status;
	companyId: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateIsoAssessmentDto {
	name: string;
	year: number;
	companyId: number;
}

export interface UpdateIsoAssessmentDto {
	id: number;
	name?: string;
	year?: number;
	status?: iso_status;
}
