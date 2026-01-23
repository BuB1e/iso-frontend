import { create } from "zustand";
import {
  type TUser,
  UserRole,
  canEditImplementation,
  canSubmitReview,
} from "~/types/TUser";

type UserStore = {
  users: TUser[];
  currentUser: TUser | null;
  setRole: (role: UserRole) => void;
  setUsers: (users: TUser[]) => void;
  setCurrentUser: (user: TUser) => void;
  logout: () => void;
};

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  currentUser: null,
  setUsers: (users) => {
    // If setting users and current is null, optionally set default?
    // For now just set users.
    set({ users });
    // Auto-select first user if none selected?
    if (!get().currentUser && users.length > 0) {
      // Prefer Internal Expert or Admin?
      const defaultUser =
        users.find((u) => u.role === UserRole.INTERNAL_EXPERT) || users[0];
      set({ currentUser: defaultUser });
    }
  },
  setCurrentUser: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null }),
  setRole: (role) => {
    // Find user with this role from users array
    const user = get().users.find((u) => u.role === role);
    if (user) {
      set({ currentUser: user });
    } else {
      console.warn(`No user found with role ${role}`);
    }
  },
}));

// Helper hooks for permissions
export const useCanEditImplementation = () => {
  const currentUser = useUserStore((state) => state.currentUser);
  if (!currentUser) return false;
  return canEditImplementation(currentUser.role);
};

export const useCanSubmitReview = () => {
  const currentUser = useUserStore((state) => state.currentUser);
  if (!currentUser) return false;
  return canSubmitReview(currentUser.role);
};
