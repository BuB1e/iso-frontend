import { create } from "zustand";
import { UserRole } from "~/types";

interface UserFormState {
  role: UserRole;
  companyId: number | null;
  editingId: string | null;
}

interface UserFormActions {
  setField: <K extends keyof UserFormState>(
    field: K,
    value: UserFormState[K],
  ) => void;
  startEdit: (id: string, role: UserRole, companyId: number | null) => void;
  reset: () => void;
}

const initialState: UserFormState = {
  role: UserRole.INTERNAL_EXPERT,
  companyId: null,
  editingId: null,
};

export const useUserFormStore = create<UserFormState & UserFormActions>(
  (set) => ({
    ...initialState,
    setField: (field, value) => set({ [field]: value }),
    startEdit: (id, role, companyId) => set({ editingId: id, role, companyId }),
    reset: () => set(initialState),
  }),
);
