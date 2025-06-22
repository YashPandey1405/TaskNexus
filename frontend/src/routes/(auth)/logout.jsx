import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import apiClient from "../../../services/apiClient";

export const Route = createFileRoute("/(auth)/logout")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const [data, setData] = useState(null);

  useEffect(() => {
    const performLogout = async () => {
      try {
        const logoutUser = await apiClient.logout();
        setData(logoutUser);

        if (logoutUser.success) {
          setTimeout(() => {
            router.navigate({ to: "/login" });
          }, 3000);
        }
      } catch (error) {
        setData({ success: false, message: "Logout failed. Try again later." });
      }
    };

    performLogout();
  }, [router]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-white">
      <div className="text-center">
        <div className="mb-4">
          <div
            className="spinner-border text-light"
            style={{ width: "4rem", height: "4rem" }}
            role="status"
          >
            <span className="visually-hidden">Logging out...</span>
          </div>
        </div>
        <h2 className="mb-2">Logging you out...</h2>
        <p className="text-muted">Redirecting to login page in 3 seconds</p>

        {data && !data.success && (
          <div className="alert alert-danger mt-4">
            {data.message || "Logout failed. Try again later."}
          </div>
        )}
      </div>
    </div>
  );
}
