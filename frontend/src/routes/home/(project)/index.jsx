import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useRouter, Link } from "@tanstack/react-router";
import Navbar from "../../../../Components/Navbar.jsx";
import apiClient from "../../../../services/apiClient.js";
import { authStore } from "../../../store/authStore.js";

export const Route = createFileRoute("/home/(project)/")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const isLoggedInZustand = authStore((state) => state.isLoggedIn);

  const [data, setData] = useState(null);

  useEffect(() => {
    const getAllProjects = async () => {
      try {
        // Redirect early if not logged in
        if (!isLoggedInZustand) {
          console.log("User is not logged in, redirecting to login page...");
          router.navigate({ to: "/login" });
          return; // stop further execution
        }

        const response = await apiClient.getProjects();
        setData(response);

        if (!response.success) {
          router.navigate({ to: "/login" });
        }

        console.log(response);
      } catch (error) {
        setData({
          success: false,
          message: "getProjects failed. Try again later.",
        });
      }
    };

    getAllProjects();
  }, [router, isLoggedInZustand]);

  return (
    <div className="bg-dark text-light min-vh-100">
      <Navbar />
      <div className="container py-2">
        {/* Top Welcome Banner */}
        <div className="row mb-4">
          <div className="col text-center border-bottom pb-3">
            <h2 className="fw-semibold">
              👋 Hello, Welcome to{" "}
              <span className="text-warning">TaskNexus</span> Platform
            </h2>
          </div>
        </div>

        {/* Conditional Content Rendering */}
        {!data ? (
          <div className="text-center mt-5">
            <div className="spinner-border text-warning" role="status" />
            <p className="mt-3">Loading projects...</p>
          </div>
        ) : !data.success ? (
          <div className="alert alert-danger text-center">{data.message}</div>
        ) : data.data.length === 0 ? (
          <div className="alert alert-warning text-center">
            No projects found.
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {data.data.map((item) => {
              const { project } = item;
              const createdDate = new Date(item.createdAt).toLocaleDateString();

              return (
                <div className="col" key={item._id}>
                  <div
                    className="card h-100 shadow-lg border-0"
                    style={{ backgroundColor: "#f8f9fa", color: "#212529" }}
                  >
                    <div className="card-body">
                      <h5 className="card-title fw-bold text-dark mb-2">
                        {project.name}
                      </h5>
                      <p className="card-text small text-muted mb-3">
                        {project.description}
                      </p>
                      <p className="mb-1">
                        <strong>Role:</strong>{" "}
                        <span className="badge bg-success">{item.role}</span>
                      </p>
                      <p className="mb-1">
                        <strong>Created By:</strong>{" "}
                        {project.createdBy.username}
                      </p>
                      <p className="text-muted small mb-0">
                        Created On: {createdDate}
                      </p>
                    </div>
                    <div className="card-footer bg-transparent border-0 d-flex gap-2">
                      {/* View - keep as is */}
                      <button className="btn btn-warning w-100">View</button>

                      {/* Edit - switch to btn-primary (a calmer but bold blue) */}
                      <button className="btn btn-primary w-100">Edit</button>

                      {/* Delete - keep red but use btn-outline-danger for visual balance */}
                      <button className="btn btn-outline-danger w-100">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
