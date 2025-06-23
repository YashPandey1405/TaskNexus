import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import Navbar from "../../../../../../Components/Navbar.jsx";
import apiClient from "../../../../../../services/apiClient.js";
import { authStore } from "../../../../../store/authStore.js";

export const Route = createFileRoute(
  "/home/(tasks)/(project-HomePage)/task/create/$pid",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { pid } = Route.useParams();
  console.log("Project ID from params:", pid);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    status: "",
  });
  const [data, setData] = useState(null);
  const [projectMemberDetails, setprojectMemberDetails] = useState(null);
  const [showAlert, setShowAlert] = useState(true);
  const [isTaskCreated, setisTaskCreated] = useState(false);

  const isLoggedInZustand = authStore((state) => state.isLoggedIn);
  const loggedInUserIdZudtand = authStore((state) => state.loggedInUserId);

  useEffect(() => {
    const getTheMemberDetails = async () => {
      try {
        // Redirect early if not logged in
        if (!isLoggedInZustand) {
          console.log("User is not logged in, redirecting to login page...");
          router.navigate({ to: "/login" });
          return; // stop further execution
        }
        const response = await apiClient.getAllProjectMembersDetails(pid);
        setprojectMemberDetails(response);

        // Only ["admin", "project_admin"] Are Allowed To Create An Task Of An Project.....
        if (response?.data?.currentUserDetails?.role === "member") {
          console.log("User is a member, redirecting to project home page...");
          router.navigate({ to: `/home/project/${pid}` });
          return; // stop further execution
        }

        if (response.success) {
          console.log("Member details fetched successfully:", response);
        }
      } catch (error) {
        setData({
          success: false,
          message: "User Not Logged In failed. Try again later.",
        });
      }
    };

    getTheMemberDetails();
  }, [router, isLoggedInZustand]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setisTaskCreated(true);
    setShowAlert(true);

    try {
      console.log("Form Data before API call:", formData);
      const projectUpdation = await apiClient.createTask(
        formData.title,
        formData.description,
        formData.assignedTo,
        formData.status,
        pid,
      );
      setData(projectUpdation);
      console.log("Project Updated response:", projectUpdation);

      if (projectUpdation.success) {
        setTimeout(() => {
          router.navigate({ to: `/home/project/${pid}` });
        }, 3000);
      }
    } catch (error) {
      setData({
        success: false,
        message: "Task Creation failed in Frontend. Try again later.",
      });
    }

    setisTaskCreated(false);
  };

  const currentUserRole = projectMemberDetails?.data?.currentUserDetails?.role;

  const ProjectMemberList =
    projectMemberDetails?.data?.allProjectMembers
      ?.filter((member) => {
        // ✅ Exclude the logged-in user
        const isNotCurrentUser =
          String(member?.user?._id) !== String(loggedInUserIdZudtand);

        // ✅ Role-based filter:
        // - If current user is "project_admin", allow all
        // - If current user is "admin", exclude members with role "project_admin"
        const isAllowedByRole =
          currentUserRole === "project_admin"
            ? true
            : member?.role !== "project_admin";

        return isNotCurrentUser && isAllowedByRole;
      })
      ?.map((member) => ({
        // Extract needed values safely
        id: member?.user?._id,
        username: member?.user?.username,
        role: member?.role,
      })) || [];

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
              Create Your Task on TaskNexus
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

              {/* Assigned To Dropdown */}
              <div className="mb-3">
                <label htmlFor="assignedTo" className="form-label">
                  Assign Task To
                </label>
                <select
                  className="form-select bg-dark text-light border-secondary"
                  id="assignedTo"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select a member
                  </option>
                  {ProjectMemberList.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.username} ({member.role})
                    </option>
                  ))}
                </select>
                <div className="form-text text-light mt-1">
                  Only <strong>admin</strong> and <strong>project_admin</strong>{" "}
                  can create tasks. <br />
                  <strong>Admin</strong> cannot assign tasks to{" "}
                  <strong>project_admin</strong>, but vice versa is allowed.
                </div>
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
                disabled={isTaskCreated}
              >
                {isTaskCreated ? "Creating Task..." : "Create Task"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
