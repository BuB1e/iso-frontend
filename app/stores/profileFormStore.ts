import { create } from "zustand";

interface ProfileFormState {
  firstName: string;
  lastName: string;
  email: string;
  isDirty: boolean;
}

interface ProfileFormActions {
  setField: <K extends keyof ProfileFormState>(
    field: K,
    value: ProfileFormState[K],
  ) => void;
  loadProfile: (data: {
    firstName: string;
    lastName: string;
    email: string;
  }) => void;
  reset: () => void;
}

const initialState: ProfileFormState = {
  firstName: "",
  lastName: "",
  email: "",
  isDirty: false,
};

export const useProfileFormStore = create<
  ProfileFormState & ProfileFormActions
>((set) => ({
  ...initialState,
  setField: (field, value) =>
    set((state) => ({ ...state, [field]: value, isDirty: true })),
  loadProfile: (data) => set({ ...data, isDirty: false }),
  reset: () => set(initialState),
}));
