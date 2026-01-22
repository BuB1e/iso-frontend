import { userRole } from "../types"

export interface UserResponseDto {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	companyId?: number | null;
	role: userRole;
	image?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateUserDto {
	email: string;
	firstName: string;
	lastName: string;
	companyId?: number;
	role: userRole;
	image?: string | null;
}

export interface UpdateUserDto {
	id: string;
	firstName?: string;
	lastName?: string;
	companyId?: number;
	image?: string;
	role?: userRole;
}
