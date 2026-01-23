import { create } from "zustand";

interface CompanyFormState {
  code: string;
  name: string;
  details: string;
  isEditing: boolean;
  editingId: number | null;
}

interface CompanyFormActions {
  setField: <K extends keyof CompanyFormState>(
    field: K,
    value: CompanyFormState[K],
  ) => void;
  setForm: (data: Partial<CompanyFormState>) => void;
  startEdit: (id: number, data: Partial<CompanyFormState>) => void;
  reset: () => void;
}

const initialState: CompanyFormState = {
  code: "",
  name: "",
  details: "",
  isEditing: false,
  editingId: null,
};

export const useCompanyFormStore = create<
  CompanyFormState & CompanyFormActions
>((set) => ({
  ...initialState,
  setField: (field, value) => set({ [field]: value }),
  setForm: (data) => set(data),
  startEdit: (id, data) => set({ ...data, isEditing: true, editingId: id }),
  reset: () => set(initialState),
}));
