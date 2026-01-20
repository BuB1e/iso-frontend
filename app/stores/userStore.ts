import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { UserRole, type TUser } from "~/types";

export interface UserStore {
  currentUser: TUser | null;
  isAuthenticated: boolean;
  setCurrentUser: (user: TUser | null) => void;
  setRole: (role: UserRole) => void;
  logout: () => void;
}

// Mock users for testing different roles
export const mockUsers: Record<UserRole, TUser> = {
  [UserRole.ADMIN]: {
    id: "admin-1",
    firstName: "Admin",
    lastName: "User",
    email: "admin@company.com",
    role: UserRole.ADMIN,
    emailVerified: true,
    company_id: 1,
  },
  [UserRole.INTERNAL_EXPERT]: {
    id: "internal-1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@company.com",
    role: UserRole.INTERNAL_EXPERT,
    emailVerified: true,
    company_id: 1,
  },
  [UserRole.EXTERNAL_EXPERT]: {
    id: "external-1",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@auditor.com",
    role: UserRole.EXTERNAL_EXPERT,
    emailVerified: true,
  },
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      currentUser: mockUsers[UserRole.INTERNAL_EXPERT], // Default to internal expert
      isAuthenticated: true,

      setCurrentUser: (user) =>
        set({ currentUser: user, isAuthenticated: !!user }),

      setRole: (role) => set({ currentUser: mockUsers[role] }),

      logout: () => set({ currentUser: null, isAuthenticated: false }),
    }),
    {
      name: "user-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

// Helper hooks for permission checks
export function useCanEditImplementation(): boolean {
  const role = useUserStore((state) => state.currentUser?.role);
  return role === UserRole.ADMIN || role === UserRole.INTERNAL_EXPERT;
}

export function useCanSubmitReview(): boolean {
  const role = useUserStore((state) => state.currentUser?.role);
  return role === UserRole.ADMIN || role === UserRole.EXTERNAL_EXPERT;
}

export function useCanManageUsers(): boolean {
  const role = useUserStore((state) => state.currentUser?.role);
  return role === UserRole.ADMIN;
}

export function useCanManageCompanies(): boolean {
  const role = useUserStore((state) => state.currentUser?.role);
  return role === UserRole.ADMIN;
}
