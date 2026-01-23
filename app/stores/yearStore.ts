import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type yearStore = {
  allYears: number[];
  currentYear: number;
  setAllYears: (allYears: number[]) => void;
  setCurrentYear: (currentYear: number) => void;
};

export const useYearStore = create<yearStore>()(
  persist(
    (set) => ({
      allYears: [],
      currentYear: new Date().getFullYear(),
      setAllYears: (allYears: number[]) => set(() => ({ allYears })),
      setCurrentYear: (currentYear: number) => set(() => ({ currentYear })),
    }),
    {
      name: "year",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
