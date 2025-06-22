import { create } from "zustand";
import { persist } from "zustand/middleware";

// Zustand auth store
export const authStore = create(
  persist((set) => ({
    isLoggedIn: false,
    loggedInUserId: null,

    // Sets isLoggedIn to true
    loginUser: (userID) => set({ isLoggedIn: true, loggedInUserId: userID }),

    // Sets isLoggedIn to false
    logoutUser: () => set({ isLoggedIn: false, loggedInUserId: null }),
  })),
);
