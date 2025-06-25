import { create } from "zustand";
import { persist } from "zustand/middleware";

// Zustand auth store
export const authStore = create(
  persist((set) => ({
    isLoggedIn: false,
    loggedInUserId: null,
    userAvatorURl: null,

    // Sets isLoggedIn to true
    loginUser: (userID, userAvatorURl) =>
      set({
        isLoggedIn: true,
        loggedInUserId: userID,
        userAvatorURl: userAvatorURl,
      }),

    // Sets isLoggedIn to false
    logoutUser: () =>
      set({ isLoggedIn: false, loggedInUserId: null, userAvatorURl: null }),
  })),
);
