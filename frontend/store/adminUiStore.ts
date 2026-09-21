import { create } from 'zustand';

interface AdminUiState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

/**
 * Shared UI state for the admin panel shell (sidebar + header).
 * The sidebar is permanently visible on lg+ screens and works as an
 * off-canvas drawer (with overlay) below that breakpoint, so every admin
 * page stays fully usable on mobile / tablet without duplicating state
 * across ~25 page components.
 */
export const useAdminUiStore = create<AdminUiState>()((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));