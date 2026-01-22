export interface CompanyResponseDto {
	id: number;
	name: string;
	code: string;
	details: string
	image?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateCompanyDto {
	name: string;
	code: string;
	details?: string;
	image?: string | null;
}

export interface UpdateCompanyDto {
	id: number;
	name?: string;
	details?: string;
	image?: string | null;
}

export interface UpdatePrivateCompanyDto {
	id: number;
	name?: string;
	code?: string;
	details?: string;
	image?: string | null;
}
