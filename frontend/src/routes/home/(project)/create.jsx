import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import apiClient from "../../../../services/apiClient";
import { authStore } from "../../../store/authStore.js";
import Navbar from "../../../../Components/Navbar.jsx";

export const Route = createFileRoute("/home/(project)/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();

  const isLoggedInZustand = authStore((state) => state.isLoggedIn);
  const loggedInUserIdZudtand = authStore((state) => state.loggedInUserId);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [data, setData] = useState(null);
  const [showAlert, setShowAlert] = useState(true);
  const [isProjectCreated, setisProjectCreated] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setisProjectCreated(true);
    setShowAlert(true);

    try {
      const projectCreated = await apiClient.createProject(
        formData.name,
        formData.description,
      );
      setData(projectCreated);
      console.log("Project creation response:", projectCreated);

      if (projectCreated.success) {
        setTimeout(() => {
          router.navigate({ to: "/home" });
        }, 3000);
      }
    } catch (error) {
      setData({
        success: false,
        message: "Project Creation failed in Frontend. Try again later.",
      });
    }

    setisProjectCreated(false);
  };

  useEffect(() => {
    const getAllProjects = async () => {
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
          message: "User Not Logged In failed. Try again later.",
        });
      }
    };

    getAllProjects();
  }, [router, isLoggedInZustand]);

  return (
    <div className="bg-dark text-light min-vh-100 d-flex flex-column">
      <Navbar />

      {/* Welcome Banner */}
      {/* <div className="container pt-4">
        <div className="row justify-content-center">
          <div className="col-auto text-center">
            <h2 className="fw-semibold">
              👋 Hello, Welcome to{" "}
              <span className="text-warning">TaskNexus</span> Platform
            </h2>
          </div>
        </div>
      </div> */}

      {/* Form Section */}
      <div className="container d-flex justify-content-center align-items-center flex-grow-1">
        <div
          className="card p-4 shadow-lg w-100"
          style={{
            maxWidth: "600px",
            borderRadius: "1.5rem",
            backgroundColor: "#1f1f1f",
            color: "#ffffff",
          }}
        >
          <h2 className="text-center mb-4 fw-semibold">
            Create a New Project in TaskNexus
          </h2>

          {/* Alert */}
          {data && showAlert && (
            <div
              className={`alert ${data.success ? "alert-success" : "alert-danger"} alert-dismissible fade show`}
              role="alert"
            >
              {data.message}
              <button
                type="button"
                className="btn-close btn-close-dark"
                aria-label="Close"
                onClick={() => setShowAlert(false)}
              ></button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Project Name
              </label>
              <input
                type="text"
                className="form-control bg-dark text-light border-secondary"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Task Management App"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="form-label">
                Project Description
              </label>
              <textarea
                className="form-control bg-dark text-light border-secondary"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                placeholder="Briefly describe what this project is about..."
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isProjectCreated}
            >
              {isProjectCreated ? "Creating Project..." : "Create Project"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
