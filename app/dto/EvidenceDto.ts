export interface EvidenceResponseDto {
	id: number;
	fileName: string;
	filePath: string;
	controlId: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface createEvidenceDto {
	fileName: string;
	filePath: string;
	controlId: number;
}

export interface updateEvidenceDto {
	id: number;
	fileName?: string;
	filePath?: string;
	controlId?: number;
}
