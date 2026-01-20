import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ControlStatus } from "~/types";

// Form data for a single control
export interface ControlFormData {
  controlCode: string;
  status: ControlStatus;
  currentPractice: string;
  evidenceDescription: string;
  context: string;
  reviewerComments?: string;
  lastModified: number; // timestamp
}

export interface FormCacheStore {
  // Control form cache - keyed by control code (e.g., "A.5.1")
  controlForms: Record<string, ControlFormData>;

  // Check if there's unsaved data for a control
  hasUnsavedChanges: (controlCode: string) => boolean;

  // Get cached form data
  getFormData: (controlCode: string) => ControlFormData | null;

  // Save form data to cache
  saveFormData: (data: ControlFormData) => void;

  // Clear form data after successful save
  clearFormData: (controlCode: string) => void;

  // Clear all cached forms
  clearAllForms: () => void;

  // Get count of unsaved forms
  getUnsavedCount: () => number;
}

export const useFormCacheStore = create<FormCacheStore>()(
  persist(
    (set, get) => ({
      controlForms: {},

      hasUnsavedChanges: (controlCode) => {
        const forms = get().controlForms;
        return !!forms[controlCode];
      },

      getFormData: (controlCode) => {
        const forms = get().controlForms;
        return forms[controlCode] || null;
      },

      saveFormData: (data) => {
        set((state) => ({
          controlForms: {
            ...state.controlForms,
            [data.controlCode]: {
              ...data,
              lastModified: Date.now(),
            },
          },
        }));
      },

      clearFormData: (controlCode) => {
        set((state) => {
          const newForms = { ...state.controlForms };
          delete newForms[controlCode];
          return { controlForms: newForms };
        });
      },

      clearAllForms: () => {
        set({ controlForms: {} });
      },

      getUnsavedCount: () => {
        return Object.keys(get().controlForms).length;
      },
    }),
    {
      name: "form-cache",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

// Hook to check for any unsaved changes (for navigation warnings)
export function useHasAnyUnsavedChanges(): boolean {
  return useFormCacheStore(
    (state) => Object.keys(state.controlForms).length > 0,
  );
}
