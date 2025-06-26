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
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 px-5 py-3 text-light bg-dark rounded shadow-sm">
        {/* Centered Welcome Text */}
        <div className="text-center fw-semibold fs-5 ">
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
          {/* <p>{apiresponse?.currentUser?.role}</p> */}
          <button
            className="btn btn-primary ms-3"
            onClick={handleCreateTask}
            disabled={apiresponse?.currentUser?.role === "member"}
          >
            Create Task
          </button>
          <button
            className="btn btn-primary ms-3"
            onClick={handleProjectMemberGET}
          >
            View Project Member
          </button>
          <button className="btn btn-primary ms-3" onClick={handleNotesGET}>
            View Project Notes
          </button>
        </div>

        {/* Right-aligned Icons */}
        <div className="d-flex gap-4 align-items-center">
          {/* Total Users Icon */}
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

          {/* Total Tasks Icon */}
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
