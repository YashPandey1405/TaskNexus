import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import Navbar from "../../../../../../Components/Navbar.jsx";
import apiClient from "../../../../../../services/apiClient.js";
import { authStore } from "../../../../../store/authStore.js";

export const Route = createFileRoute(
  "/home/(tasks)/(project-HomePage)/task/update/$tid",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { tid } = Route.useParams();
  console.log("Task ID from params:", tid);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    assignedBy: "",
    status: "",
  });
  const [data, setData] = useState(null);
  const [currentUserDetails, setcurrentUserDetails] = useState(null);
  const [showAlert, setShowAlert] = useState(true);
  const [isTaskUpdated, setisTaskUpdated] = useState(false);
  const [projectID, setProjectID] = useState(null);

  const isLoggedInZustand = authStore((state) => state.isLoggedIn);
  const loggedInUserIdZudtand = authStore((state) => state.loggedInUserId);

  useEffect(() => {
    const getTheTaskDetails = async () => {
      try {
        // Redirect early if not logged in
        if (!isLoggedInZustand) {
          console.log("User is not logged in, redirecting to login page...");
          router.navigate({ to: "/login" });
          return; // stop further execution
        }
        const response = await apiClient.getTaskByID(tid);
        setcurrentUserDetails(response);

        // Only Task Creator & "project_admin" Are Allowed To Edit An Task Of An Project.....
        if (
          response?.data?.currentUserTask?.assignedBy?._id !=
            loggedInUserIdZudtand ||
          response?.currentLoggedInUserDetails?.role === "project_admin"
        ) {
          console.log("You Are Not Allowed To Change The Task");
          router.navigate({ to: `/home` });
          return; // stop further execution
        }

        if (response.success) {
          const responseData = response?.data;

          // Set The Project ID Which Will Be Used While reDirect.....
          setProjectID(responseData?.currentUserTask?.project?._id);

          const assignedByUserName =
            responseData?.currentUserTask?.assignedBy?._id ==
            loggedInUserIdZudtand
              ? "You"
              : responseData?.currentUserTask?.assignedBy?.username;

          const assignedToUserName =
            responseData?.currentUserTask?.assignedTo?._id ==
            loggedInUserIdZudtand
              ? "You"
              : responseData?.currentUserTask?.assignedTo?.username;

          formData.title = responseData?.currentUserTask?.title;
          formData.description = responseData?.currentUserTask?.description;
          formData.assignedBy = `${assignedByUserName} (${responseData?.assignedByUserRole?.role})`;
          formData.assignedTo = `${assignedToUserName} (${responseData?.assignedToUserRole?.role})`;
          formData.status = responseData?.currentUserTask?.status;
          console.log("Member details fetched successfully:", response);
        }
      } catch (error) {
        setData({
          success: false,
          message: "User Not Logged In failed. Try again later.",
        });
      }
    };

    getTheTaskDetails();
  }, [router, isLoggedInZustand]);

  console.log("The Current User Id : ", loggedInUserIdZudtand);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setisTaskUpdated(true);
    setShowAlert(true);

    try {
      console.log("Form Data before API call:", formData);
      const taskUpdated = await apiClient.updateTask(
        formData.title,
        formData.description,
        formData.status,
        tid,
      );
      console.log("1");
      setData(taskUpdated);
      console.log("Task Updated response:", taskUpdated);

      if (taskUpdated.success) {
        console.log("1");
        setTimeout(() => {
          router.navigate({ to: `/home/project/${projectID}` });
        }, 3000);
      }
    } catch (error) {
      setData({
        success: false,
        message: "Task Updation failed in Frontend. Try again later.",
      });
    }

    setisTaskUpdated(false);
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
            <h2 className="text-center mb-4 fw-semibold">
              Update Your Task on TaskNexus
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

            {/* <p>{formData.status}</p> */}
            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Title Field */}
              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  Title Of The Task
                </label>
                <input
                  type="text"
                  className="form-control bg-dark text-light border-secondary"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Title of the Task"
                />
              </div>

              {/* Description Field */}
              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Task Description
                </label>
                <textarea
                  className="form-control bg-dark text-light border-secondary"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Briefly describe what this Task is about..."
                  required
                ></textarea>
              </div>

              {/* AssignedBy User Field */}
              <div className="mb-3">
                <label htmlFor="assignedBy" className="form-label">
                  Task Creator
                </label>
                <input
                  type="text"
                  className="form-control bg-dark text-light border-secondary"
                  id="assignedBy"
                  name="assignedBy"
                  value={formData.assignedBy}
                  disabled
                ></input>
              </div>

              {/* AssignedTo User Field */}
              <div className="mb-3">
                <label htmlFor="assignedTo" className="form-label">
                  Task Assignee
                </label>
                <input
                  type="text"
                  className="form-control bg-dark text-light border-secondary"
                  id="assignedTo"
                  name="assignedTo"
                  value={formData.assignedTo}
                  disabled
                ></input>
              </div>

              {/* Current Status Field */}
              <div className="mb-3">
                <label htmlFor="status" className="form-label">
                  Current Status of the Task
                </label>
                <select
                  className="form-select bg-dark text-light border-secondary"
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={isTaskUpdated}
              >
                {isTaskUpdated ? "Updating Task..." : "Update Task"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
