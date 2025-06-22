import { create } from "zustand";

// Zustand auth store
export const authStore = create((set) => ({
  isLoggedIn: false,
  loggedInUserId: null,

  // Sets isLoggedIn to true
  loginUser: (userID) => set({ isLoggedIn: true, loggedInUserId: userID }),

  // Sets isLoggedIn to false
  logoutUser: () => set({ isLoggedIn: false, loggedInUserId: null }),
}));
