import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminState {
  selectedCompanyId: number | null;
  setSelectedCompanyId: (id: number | null) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      selectedCompanyId: null,
      setSelectedCompanyId: (id) => set({ selectedCompanyId: id }),
    }),
    {
      name: "admin-storage",
    },
  ),
);
