import * as React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { useRouter, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { authStore } from "../store/authStore.js";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const router = useRouter();

  const isLoggedInZustand = authStore((state) => state.isLoggedIn);
  const loggedInUserIdZudtand = authStore((state) => state.loggedInUserId);
  console.log("Is User Logged In:", isLoggedInZustand);
  console.log("User ID:", loggedInUserIdZudtand);

  // Redirect to login if not logged in , Else Redirect to home.....
  useEffect(() => {
    const getRedirect = async () => {
      try {
        // Redirect early if not logged in
        if (!isLoggedInZustand) {
          console.log("User is not logged in, redirecting to login page...");
          router.navigate({ to: "/login" });
          return; // stop further execution
        }
      } catch (error) {
        setData({
          success: false,
          message: "getProjects failed. Try again later.",
        });
      }
    };

    getRedirect();
  }, [router, isLoggedInZustand]);

  return (
    <React.Fragment>
      <Outlet />
    </React.Fragment>
  );
}
