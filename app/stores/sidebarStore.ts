import { create } from "zustand";
import { ESidebarPage } from "~/types";
import { createJSONStorage, persist } from "zustand/middleware";

export type SidebarStore = {
	isOpen: boolean;
	currentPage: ESidebarPage;
	toggleOpen: () => void;
	setCurrentPage: (currentPage: ESidebarPage) => void;
};

export const useSidebarStore = create<SidebarStore>()(
	persist(
		(set) => ({
			isOpen: true,
			currentPage: ESidebarPage.Dashboard,
			toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
			setCurrentPage: (currentPage: ESidebarPage) => set(() => ({ currentPage })),
		}),
		{
			name: "sidebar",
			storage: createJSONStorage(() => localStorage),
		}
	)
);
