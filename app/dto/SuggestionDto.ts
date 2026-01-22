export interface SuggestionResponseDto {
	id: number;
	content: string;
	createdAt: Date;
	updatedAt: Date;
	controlId: number;
}

export interface CreateSuggestionDto {
	content: string;
	controlId: number;
}

export interface UpdateSuggestionDto {
	id: number;
	content: string;
}
