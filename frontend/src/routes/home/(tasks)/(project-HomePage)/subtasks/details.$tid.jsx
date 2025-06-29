import React, { useState, useEffect } from "react";
import { Tooltip } from "bootstrap";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import Navbar from "../../../../../../Components/Navbar";
import apiClient from "../../../../../../services/apiClient";
import { authStore } from "../../../../../store/authStore";

export const Route = createFileRoute(
  "/home/(tasks)/(project-HomePage)/subtasks/details/$tid",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const { tid } = Route.useParams();

  const [data, setData] = useState(null);
  const [showSubTasks, setshowSubTasks] = useState(false);
  const [apiresponse, setapiresponse] = useState(null);
  const [content, setcontent] = useState("");
  const [showAlert, setShowAlert] = useState(true);
  const [isNoteCreated, setisNoteCreated] = useState(false);

  const isLoggedInZustand = authStore((state) => state.isLoggedIn);
  const loggedInUserIdZustand = authStore((state) => state.loggedInUserId);
  let currentUserRole;

  // UseEffect to fetch project data and the Related Tasks Of The Project.....
  useEffect(() => {
    const getAllSubTasks = async () => {
      try {
        if (!isLoggedInZustand) {
          router.navigate({ to: "/login" });
          return;
        }

        const response = await apiClient.getAllSubTasksOfCurrentTask(tid);

        const tooltipTriggerList = document.querySelectorAll(
          '[data-bs-toggle="tooltip"]',
        );
        tooltipTriggerList.forEach((el) => new Tooltip(el));
        if (response.success) {
          setapiresponse(response?.data);
        }
      } catch (error) {
        setapiresponse({
          success: false,
          message: "User Not Logged In failed. Try again later.",
        });
      }
    };

    getAllSubTasks();
  }, [router, isLoggedInZustand]);

  function ToggleSubTasksShow() {
    let currentValue = showSubTasks;
    setshowSubTasks(!currentValue);
  }

  function GetBackButton() {
    let currentProjectID = apiresponse?.requestedTask?.project._id;
    router.navigate({
      to: `/home/project/${currentProjectID}`,
    });
  }

  function createSubTask() {
    router.navigate({
      to: `/home/subtasks/create/${tid}`,
    });
  }

  function handleEditSubTask(subTaskID) {
    router.navigate({
      to: `/home/subtasks/edit/${subTaskID}`,
    });
  }

  async function handleDeleteSubTask(subTaskID) {
    try {
      const response = await apiClient.deleteSubTask(subTaskID);
      if (response.success) {
        setTimeout(() => {
          window.location.reload();
        }, 3000); // 3000 ms = 3 seconds
      }
    } catch (error) {
      router.navigate({ to: `/home` });
    }
  }

  currentUserRole = apiresponse?.currentUserRole?.role;

  return (
    <div className="bg-dark min-vh-100">
      <Navbar />

      <div className="container py-3">
        <div className="row align-items-center">
          {/* Back Button */}
          <div className="col-2 col-sm-2 text-start">
            <button className="btn btn-primary py-2" onClick={GetBackButton}>
              &lt;Back
            </button>
          </div>

          {/* Title */}
          <div className="col-8 col-sm-8 text-center">
            <h1 className="text-white h4 h3-sm m-0">
              Welcome To TaskNexus Platform
            </h1>
          </div>

          {/* Right Space Filler */}
          <div className="col-2 col-sm-2"></div>
        </div>
      </div>

      <div className="container py-4">
        <div className="card bg-dark text-light shadow-lg border border-secondary rounded-4">
          <div
            className="card-body p-4"
            style={{
              boxShadow: "rgba(255, 255, 255, 0.08) 0px 5px 15px",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h4 className="card-title text-info mb-1">
                  🧠 {apiresponse?.requestedTask.title}
                </h4>
                <h6 className="card-subtitle text-secondary">
                  🗂 Project Name:{" "}
                  <span className="text-light fw-semibold">
                    {apiresponse?.requestedTask.project.name}
                  </span>
                </h6>
              </div>
              <span
                className={`badge fs-6 px-3 py-2 rounded-pill bg-${apiresponse?.requestedTask.status === "todo" ? "primary" : "done" ? "success" : "warning"} text-dark text-uppercase`}
              >
                {apiresponse?.requestedTask.status}
              </span>
            </div>

            <p className="card-text fst-italic border-start border-3 border-info ps-3 mb-4">
              {apiresponse?.requestedTask.description}
            </p>

            <div className="row g-3">
              <div className="col-md-6">
                <div className="bg-secondary bg-opacity-10 p-3 rounded d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
                  <div className="text-wrap">
                    <strong>👤 Assigned By:</strong>{" "}
                    {apiresponse?.requestedTask.assignedBy.username}
                  </div>

                  <span
                    className={`badge fs-6 px-3 py-2 rounded-pill text-uppercase fw-semibold ${
                      apiresponse?.assignedByUserRole?.role === "member"
                        ? "bg-warning text-dark"
                        : apiresponse?.assignedByUserRole?.role === "admin"
                          ? "bg-primary"
                          : "bg-success"
                    }`}
                    style={{ minWidth: "110px", textAlign: "center" }}
                  >
                    {apiresponse?.assignedByUserRole?.role}
                  </span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="bg-secondary bg-opacity-10 p-3 rounded d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
                  <div className="text-wrap">
                    <strong>👤 Assigned To:</strong>{" "}
                    {apiresponse?.requestedTask.assignedTo.username}
                  </div>

                  <span
                    className={`badge fs-6 px-3 py-2 rounded-pill text-uppercase fw-semibold ${
                      apiresponse?.assignedToUserRole?.role === "member"
                        ? "bg-warning text-dark"
                        : apiresponse?.assignedByUserRole?.role === "admin"
                          ? "bg-primary"
                          : "bg-success"
                    }`}
                    style={{ minWidth: "110px", textAlign: "center" }}
                  >
                    {apiresponse?.assignedToUserRole?.role}
                  </span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="bg-secondary bg-opacity-10 p-3 rounded">
                  <strong>📅 Created At:</strong>{" "}
                  {new Date(
                    apiresponse?.requestedTask.createdAt,
                  ).toLocaleString()}
                </div>
              </div>
              <div className="col-md-6">
                <div className="bg-secondary bg-opacity-10 p-3 rounded">
                  <strong>🕒 Updated At:</strong>{" "}
                  {new Date(
                    apiresponse?.requestedTask.updatedAt,
                  ).toLocaleString()}
                </div>
              </div>
            </div>

            <hr className="border-secondary mt-4" />

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-info btn-sm px-3"
                onClick={ToggleSubTasksShow}
              >
                {showSubTasks ? "❌ Hide Subtasks" : "📂 View Subtasks"}
              </button>
              <button
                className="btn btn-outline-light btn-sm px-3"
                onClick={() => alert("Currently, No Attachment Available")}
              >
                📎 Show Attachment
              </button>
              <button
                className="btn btn-outline-warning btn-sm px-3"
                onClick={createSubTask}
                disabled={
                  apiresponse?.requestedTask?.assignedBy._id !=
                    loggedInUserIdZustand && currentUserRole !== "project_admin"
                }
              >
                ➕ create SubTask
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSubTasks && (
        <div className="container py-4">
          <div className="row g-4">
            <h2 className="text-center text-white mb-2 border-top pt-4">
              🧩 All Subtasks for Task :{" "}
              <span className="text-info">
                {apiresponse?.requestedTask.title}
              </span>
            </h2>
            {apiresponse?.allAssociatedSubTasks?.length === 0 ? (
              <div className="col-12">
                <div
                  className="alert alert-info text-center rounded-4 shadow-sm"
                  role="alert"
                >
                  📭 No subtasks available currently. Add one to get started!
                </div>
              </div>
            ) : (
              apiresponse?.allAssociatedSubTasks?.map((subtask) => (
                <div key={subtask._id} className="col-12 col-lg-6">
                  <div
                    className="card bg-dark text-light shadow-lg border border-secondary rounded-4 h-100"
                    style={{
                      boxShadow: "rgba(255, 255, 255, 0.08) 0px 5px 15px",
                    }}
                  >
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <h5 className="card-title text-info mb-0">
                          🧩 {subtask.title}
                        </h5>
                        <img
                          src={
                            subtask?.currentSubTaskCreatorRole?.user?.avatar
                              ?.url
                          }
                          alt="avatar"
                          className="rounded-circle"
                          style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "cover",
                            border: "2px solid yellow",
                          }}
                        />
                      </div>

                      <p className="card-text mb-2">
                        <strong>👤 Created By:</strong>{" "}
                        {subtask?.currentSubTaskCreatorRole?.user?.username}
                        &nbsp;
                        <span
                          className={`badge text-uppercase fw-medium ${
                            subtask?.currentSubTaskCreatorRole?.role ===
                            "member"
                              ? "bg-warning text-dark"
                              : subtask?.currentSubTaskCreatorRole?.role ===
                                  "admin"
                                ? "bg-primary"
                                : "bg-success"
                          }`}
                        >
                          {subtask?.currentSubTaskCreatorRole?.role}
                        </span>
                      </p>

                      <p className="card-text mb-2">
                        <strong>Status:</strong>{" "}
                        <span
                          className={`badge text-uppercase fw-small ${
                            subtask.isCompleted
                              ? "bg-success"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {subtask.isCompleted ? "Completed" : "Pending"}
                        </span>
                      </p>

                      <p className="card-text mb-1">
                        <strong>📅 Created At:</strong>{" "}
                        {new Date(subtask.createdAt).toLocaleString()}
                      </p>
                      <div className="d-flex justify-content-between align-items-center">
                        <p className="card-text mb-0">
                          <strong>🕒 Last Updated:</strong>{" "}
                          {new Date(subtask.updatedAt).toLocaleString()}
                        </p>
                        <div>
                          <button
                            className="btn btn-sm btn-outline-warning me-2"
                            onClick={() => handleEditSubTask(subtask._id)}
                            disabled={
                              subtask.createdBy != loggedInUserIdZustand &&
                              currentUserRole !== "project_admin"
                            }
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                              const confirmed = window.confirm(
                                "Are you sure you want to delete this sub-task?",
                              );
                              if (confirmed) {
                                handleDeleteSubTask(subtask._id);
                              }
                            }}
                            disabled={
                              subtask.createdBy != loggedInUserIdZustand &&
                              currentUserRole !== "project_admin"
                            }
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
