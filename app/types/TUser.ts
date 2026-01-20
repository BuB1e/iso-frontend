// Matches Prisma enum: userRole
export enum UserRole {
  INTERNAL_EXPERT = "INTERNAL_EXPERT",
  EXTERNAL_EXPERT = "EXTERNAL_EXPERT",
  ADMIN = "ADMIN",
}

// Matches Prisma model: User
export interface TUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  image?: string;
  company_id?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Role display configuration
export const userRoleConfig: Record<
  UserRole,
  { label: string; description: string; color: string; bgColor: string }
> = {
  [UserRole.INTERNAL_EXPERT]: {
    label: "INTERNAL EXPERT",
    description: "Can edit implementation, view reviews",
    color: "text-main-blue",
    bgColor: "bg-main-blue/10",
  },
  [UserRole.EXTERNAL_EXPERT]: {
    label: "EXTERNAL EXPERT",
    description: "Can view assessments and controls",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  [UserRole.ADMIN]: {
    label: "ADMIN",
    description: "Full access to all features",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
  },
};

// Check if user can edit implementation
export function canEditImplementation(role: UserRole): boolean {
  return role === UserRole.INTERNAL_EXPERT || role === UserRole.ADMIN;
}

// Check if user can submit reviews - DISABLED: No Review model in schema
export function canSubmitReview(role: UserRole): boolean {
  // Review functionality not available yet - no Review table in schema
  return false;
}

// Mock current user - TODO: Replace with auth context
export function getMockCurrentUser(): TUser {
  return {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    role: UserRole.INTERNAL_EXPERT, // Change to EXTERNAL_EXPERT to test review permissions
    emailVerified: true,
  };
}
