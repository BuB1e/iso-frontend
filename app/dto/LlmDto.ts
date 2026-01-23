// API is in Control Service

export interface LlmSuggestRequest {
	id: number;
	controlCode: string;
	title: string;
	description: string;
	guidance: string;
	status: string;
	currentPractice: string;
	evidenceDescription?: string;
	userContext?: string;
}
