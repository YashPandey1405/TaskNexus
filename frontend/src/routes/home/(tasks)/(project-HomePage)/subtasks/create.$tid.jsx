import React, { useState, useEffect } from "react";
import { Tooltip } from "bootstrap";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import Navbar from "../../../../../../Components/Navbar";
import apiClient from "../../../../../../services/apiClient";
import { authStore } from "../../../../../store/authStore";

export const Route = createFileRoute(
  "/home/(tasks)/(project-HomePage)/subtasks/create/$tid",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const { tid } = Route.useParams();

  const [formData, setFormData] = useState({
    title: "",
    isCompleted: "",
  });

  const [data, setData] = useState(null);
  const [apiresponse, setapiresponse] = useState(null);
  const [isSubTaskCreated, setisSubTaskCreated] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  const isLoggedInZustand = authStore((state) => state.isLoggedIn);
  const loggedInUserIdZustand = authStore((state) => state.loggedInUserId);
  let currentUserRole;

  // UseEffect to fetch project members data and the Related Tasks Of The Project.....
  useEffect(() => {
    const getTheSubTasksList = async () => {
      try {
        if (!isLoggedInZustand) {
          router.navigate({ to: "/login" });
          return;
        }
      } catch (error) {
        setapiresponse({
          success: false,
          message: "User Not Logged In failed. Try again later.",
        });
      }
    };

    getTheSubTasksList();
  }, [router, isLoggedInZustand]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setisSubTaskCreated(true);
    setShowAlert(true);

    try {
      const projectUpdation = await apiClient.createSubTask(
        formData.title,
        formData.isCompleted,
        tid,
      );
      setData(projectUpdation);

      if (projectUpdation.success) {
        setTimeout(() => {
          router.navigate({ to: `/home/subtasks/details/${tid}` });
        }, 3000);
      }
    } catch (error) {
      setData({
        success: false,
        message: "Project Member Creation failed in Frontend. Try again later.",
      });
    }

    setisSubTaskCreated(false);
  };

  return (
    <div>
      {/* The Actual Form Content */}
      <div className="bg-dark text-light min-vh-100 d-flex flex-column">
        <Navbar />
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
            <h2 className="text-center mb-4 fw-semibold">Create An Sub-Task</h2>
            {/* <p>{formData.userID}</p>
            <p>{formData.role}</p> */}

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

            {/* <p>{formData.status}</p> */}
            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Added To Project By Field */}
              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  Title Of The Sub-Task
                </label>
                <textarea
                  className="form-control bg-dark text-light border-secondary"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  rows={2}
                />
              </div>

              {/* Project Member Creator Field */}
              <div className="mb-5">
                <label htmlFor="isCompleted" className="form-label">
                  Status Of Sub-Task
                </label>
                <select
                  className="form-select bg-dark text-light border-secondary"
                  id="isCompleted"
                  name="isCompleted"
                  value={formData.isCompleted}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled hidden>
                    -- Select status --
                  </option>
                  <option value="false">🕒 Pending</option>
                  <option value="true">✅ Completed</option>
                </select>
                {/* 🔽 Helper Text Below */}
                <div className="form-text text-secondary mt-1">
                  • Only Project Admin & Task Creator Are Allowed To Create An
                  Sub-Task
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={isSubTaskCreated}
              >
                {isSubTaskCreated
                  ? "Creating Sub-Task..."
                  : "Create New Sub-Task"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
