import * as React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { authStore } from "../store/authStore";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const router = useRouter();

  const isLoggedInZustand = authStore((state) => state.isLoggedIn);

  // useEffect(() => {
  //   const redirectToAboutPage = async () => {
  //     try {
  //       if (!isLoggedInZustand) {
  //         router.navigate({ to: "/login" });
  //       }
  //     } catch (error) {
  //       setData({
  //         success: false,
  //         message: "User Not Logged In failed. Try again later.",
  //       });
  //     }
  //   };

  //   redirectToAboutPage();
  // }, [router]);
  return (
    <React.Fragment>
      <Outlet />
    </React.Fragment>
  );
}
