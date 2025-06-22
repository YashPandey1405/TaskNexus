import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import Navbar from "../../../../Components/Navbar.jsx";
import apiClient from "../../../../services/apiClient.js";
import { authStore } from "../../../store/authStore.js";

export const Route = createFileRoute("/home/(project)/edit/$pid")({
  component: RouteComponent,
});

function RouteComponent() {
  const { pid } = Route.useParams();
  console.log("Project ID from params:", pid);
  const router = useRouter();

  const isLoggedInZustand = authStore((state) => state.isLoggedIn);
  const loggedInUserIdZudtand = authStore((state) => state.loggedInUserId);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [data, setData] = useState(null);
  const [formdatavalues, setformdatavalues] = useState(null);
  const [showAlert, setShowAlert] = useState(true);
  const [isProjectUpdated, setisProjectUpdated] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setisProjectUpdated(true);
    setShowAlert(true);

    try {
      const projectUpdation = await apiClient.editProject(
        formData.name,
        formData.description,
        pid,
      );
      setData(projectUpdation);
      console.log("Project Updated response:", projectUpdation);

      if (projectUpdation.success) {
        setTimeout(() => {
          router.navigate({ to: "/home" });
        }, 3000);
      }
    } catch (error) {
      setData({
        success: false,
        message: "Project Updation failed in Frontend. Try again later.",
      });
    }

    setisProjectUpdated(false);
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
        const response = await apiClient.getProjectByID(pid);
        setformdatavalues(response);

        if (response.success) {
          formData.name = response.data.name;
          formData.description = response.data.description;
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
            Edit Your Project on TaskNexus
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
              disabled={isProjectUpdated}
            >
              {isProjectUpdated ? "Updating Project..." : "Update Project"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
