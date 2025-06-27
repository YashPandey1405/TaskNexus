// My Main Project Display Page For The Kanban Board......

import React, { useState, useEffect } from "react";
import { Tooltip } from "bootstrap";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import Navbar from "../../../../../Components/Navbar.jsx";
import apiClient from "../../../../../services/apiClient.js";
import { authStore } from "../../../../store/authStore.js";
import KanbanBoard from "../../../../../Components/KanbanBoard.jsx";

export const Route = createFileRoute(
  "/home/(tasks)/(project-HomePage)/project/$pid",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const { pid } = Route.useParams();
  console.log("Project ID from params:", pid);

  const [apiresponse, setapiresponse] = useState(null);
  const [formdatavalues, setformdatavalues] = useState(null);
  const [showAlert, setShowAlert] = useState(true);
  const [isProjectUpdated, setisProjectUpdated] = useState(false);

  const isLoggedInZustand = authStore((state) => state.isLoggedIn);
  const loggedInUserIdZustand = authStore((state) => state.loggedInUserId);

  // UseEffect to fetch project data and the Related Tasks Of The Project.....
  useEffect(() => {
    const getTheProjects = async () => {
      try {
        if (!isLoggedInZustand) {
          console.log("User is not logged in, redirecting to login page...");
          router.navigate({ to: "/login" });
          return;
        }

        const response = await apiClient.getAllTasksOfProject(pid);

        setapiresponse(response.data);

        const tooltipTriggerList = document.querySelectorAll(
          '[data-bs-toggle="tooltip"]',
        );
        tooltipTriggerList.forEach((el) => new Tooltip(el));
        if (response.success) {
          console.log("Project data fetched successfully:", response);
        }
      } catch (error) {
        setapiData({
          success: false,
          message: "User Not Logged In failed. Try again later.",
        });
      }
    };

    getTheProjects();
  }, [router, isLoggedInZustand]);

  function handleCreateTask() {
    router.navigate({ to: `/home/task/create/${pid}` });
  }

  function handleProjectMemberGET() {
    router.navigate({ to: `/home/project-member/details/${pid}` });
  }

  function handleNotesGET() {
    router.navigate({ to: `/home/notes/details/${pid}` });
  }

  return (
    <div className="min-vh-100 bg-dark text-white d-flex flex-column">
      <Navbar />
      <div className="container-fluid px-3 px-md-5 py-3 text-light bg-dark rounded shadow-sm">
        <div className="row gy-3 align-items-center justify-content-between">
          {/* Welcome Text + Dropdown */}
          <div className="col-12 col-md-7">
            <div className="text-center text-md-start fw-semibold fs-5">
              Project&nbsp;
              <span className="text-info">
                ‘{apiresponse?.projectCreator?.project?.name}’
              </span>
              &nbsp;was created by&nbsp;
              <span className="text-warning">
                {apiresponse?.projectCreator?.user?.username}
              </span>
              &nbsp;on&nbsp;
              <span className="text-secondary">
                {new Date(
                  apiresponse?.projectCreator?.createdAt,
                ).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <div className="dropdown d-inline-block ms-2 mt-2 mt-md-0">
                <button
                  className="btn btn-outline-light dropdown-toggle btn-sm"
                  type="button"
                  id="projectActionsDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Project Actions
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-dark"
                  aria-labelledby="projectActionsDropdown"
                >
                  <li>
                    <button
                      className="dropdown-item d-flex justify-content-between align-items-center"
                      onClick={handleCreateTask}
                      disabled={apiresponse?.currentUser?.role === "member"}
                      title={
                        apiresponse?.currentUser?.role === "member"
                          ? "Only project admins can create tasks"
                          : ""
                      }
                      style={
                        apiresponse?.currentUser?.role === "member"
                          ? { opacity: 0.5, pointerEvents: "none" }
                          : {}
                      }
                    >
                      <span>
                        <i className="fas fa-plus me-2"></i>Create Task
                      </span>
                      {apiresponse?.currentUser?.role === "member" && (
                        <i className="fas fa-lock text-warning ms-2"></i>
                      )}
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={handleProjectMemberGET}
                    >
                      <i className="fas fa-users me-2"></i>View Project Members
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleNotesGET}>
                      <i className="fas fa-sticky-note me-2"></i>View Project
                      Notes
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Stats Icons */}
          <div className="col-12 col-md-5 d-flex flex-wrap justify-content-center justify-content-md-end gap-3">
            <span
              className="d-flex align-items-center fw-bold fs-5"
              style={{ color: "#17c0eb", cursor: "pointer" }}
              data-bs-toggle="tooltip"
              data-bs-placement="bottom"
              title="Total Users In The Project"
            >
              <i className="fas fa-users me-2"></i>
              {apiresponse?.projectTotalUsers}
            </span>

            <span
              className="d-flex align-items-center fw-bold fs-5"
              style={{ color: "#f9ca24", cursor: "pointer" }}
              data-bs-toggle="tooltip"
              data-bs-placement="bottom"
              title="Total Tasks In The Project"
            >
              <i className="fas fa-tasks me-2"></i>
              {apiresponse?.tasks?.length}
            </span>

            <span
              className="d-flex align-items-center fw-bold fs-5"
              style={{ color: "#2ecc71", cursor: "pointer" }}
              data-bs-toggle="tooltip"
              data-bs-placement="bottom"
              title="Total Notes In The Project"
            >
              <i className="fas fa-sticky-note me-2"></i>
              {apiresponse?.totalNotesInTheProject}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-grow-1">
        <KanbanBoard
          KanbanBoardTaskData={apiresponse?.tasks}
          currentUser={apiresponse?.currentUser}
        />
      </div>
    </div>
  );
}
