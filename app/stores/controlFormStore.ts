import { create } from "zustand";
import { ControlStatus } from "~/types";

interface ControlFormState {
  controlId: number | null;
  status: ControlStatus;
  currentPractice: string;
  userContext: string;
  evidenceDescription: string;
  isDirty: boolean;
}

interface ControlFormActions {
  setField: <K extends keyof ControlFormState>(
    field: K,
    value: ControlFormState[K],
  ) => void;
  loadControl: (data: {
    controlId: number;
    status: ControlStatus;
    currentPractice: string;
    userContext?: string | null;
    evidenceDescription?: string | null;
  }) => void;
  markDirty: () => void;
  reset: () => void;
}

const initialState: ControlFormState = {
  controlId: null,
  status: ControlStatus.NOT_IMPLEMENTED,
  currentPractice: "",
  userContext: "",
  evidenceDescription: "",
  isDirty: false,
};

export const useControlFormStore = create<
  ControlFormState & ControlFormActions
>((set) => ({
  ...initialState,
  setField: (field, value) =>
    set((state) => ({ ...state, [field]: value, isDirty: true })),
  loadControl: (data) =>
    set({
      controlId: data.controlId,
      status: data.status,
      currentPractice: data.currentPractice,
      userContext: data.userContext || "",
      evidenceDescription: data.evidenceDescription || "",
      isDirty: false,
    }),
  markDirty: () => set({ isDirty: true }),
  reset: () => set(initialState),
}));
