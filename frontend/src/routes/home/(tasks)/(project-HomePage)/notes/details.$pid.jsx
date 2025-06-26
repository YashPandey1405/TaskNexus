import React, { useState, useEffect } from "react";
import { Tooltip } from "bootstrap";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import Navbar from "../../../../../../Components/Navbar";
import apiClient from "../../../../../../services/apiClient";
import { authStore } from "../../../../../store/authStore";

export const Route = createFileRoute(
  "/home/(tasks)/(project-HomePage)/notes/details/$pid",
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
  let currentUserRole;

  // UseEffect to fetch project data and the Related Tasks Of The Project.....
  useEffect(() => {
    const getTheNotesData = async () => {
      try {
        if (!isLoggedInZustand) {
          console.log("User is not logged in, redirecting to login page...");
          router.navigate({ to: "/login" });
          return;
        }

        const response = await apiClient.getAllNotesOfProject(pid);

        setapiresponse(response?.data);

        const tooltipTriggerList = document.querySelectorAll(
          '[data-bs-toggle="tooltip"]',
        );
        tooltipTriggerList.forEach((el) => new Tooltip(el));
        if (response.success) {
          console.log("Notes data fetched successfully:", response);
        }
      } catch (error) {
        setapiData({
          success: false,
          message: "User Not Logged In failed. Try again later.",
        });
      }
    };

    getTheNotesData();
  }, [router, isLoggedInZustand]);

  currentUserRole = apiresponse?.currentUserRole;
  console.log("currentUserRole: ", currentUserRole);
  console.log(apiresponse);

  // Color Pallete Based On The Note Creator Role......
  const roleBadgeColors = {
    project_admin: "danger",
    member: "primary",
    viewer: "secondary",
  };

  function handleCreateNote() {
    router.navigate({ to: `/home/notes/create/$pid` });
  }

  function handleEdit() {}
  function handleDelete() {}
  return (
    <div className="container-fluid bg-dark text-light min-vh-100">
      <Navbar />
      <div className="pb-4 px-3">
        {/* Centered Welcome Text */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pb-3 border-bottom border-secondary mb-4">
          <div className="fw-semibold fs-5 text-center">
            Project&nbsp;
            <span className="text-info">
              ‘{apiresponse?.currentProject?.name}’
            </span>
            &nbsp;was created by&nbsp;
            <span className="text-warning">
              {apiresponse?.currentProject?.createdBy?.username}
            </span>
            &nbsp;on&nbsp;
            <span className="text-secondary">
              {new Date(
                apiresponse?.currentProject?.createdAt,
              ).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Members Are Not Allowed To Create An Project Note */}
          <button
            className="btn btn-primary me-2"
            onClick={handleCreateNote}
            disabled={currentUserRole === "member"}
          >
            Create Note
          </button>
        </div>

        {apiresponse?.allProjectNotes?.length === 0 ? (
          <p className="text-muted text-center">No notes found.</p>
        ) : (
          <div className="row g-4">
            {apiresponse?.allProjectNotes?.map((note) => {
              const { _id, content, createdAt, updatedAt, createdBy, role } =
                note;
              const isEdited = createdAt !== updatedAt;
              const badgeColor = roleBadgeColors[role] || "secondary";

              // ✅ Custom date formatting
              const formatDate = (isoString) => {
                const date = new Date(isoString);
                const day = date.getDate();
                const month = date.toLocaleString("default", {
                  month: "long",
                });
                const year = date.getFullYear();
                let hours = date.getHours();
                const minutes = date.getMinutes().toString().padStart(2, "0");
                const ampm = hours >= 12 ? "PM" : "AM";
                hours = hours % 12 || 12;
                return `${day} ${month} ${year} at ${hours}:${minutes}${ampm}`;
              };

              const formattedTime = formatDate(createdAt);

              return (
                <div key={_id} className="col-12 col-md-6">
                  <div className="card bg-dark border border-secondary border-3 text-light h-100 custom-white-shadow">
                    <div
                      className="card-body d-flex flex-column justify-content-between "
                      style={{
                        boxShadow: "rgba(255, 255, 255, 0.35) 0px 5px 15px",
                      }}
                    >
                      {/* Row 1: Avatar, Name, Role */}
                      <div className="d-flex align-items-center mb-3">
                        <img
                          src={createdBy.avatar.url}
                          alt="avatar"
                          className="me-3"
                          style={{
                            width: "45px",
                            height: "45px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "2px solid #555", // Inner dark border
                            boxShadow: "0 0 0 3px #ffc107", // Outer warning border
                          }}
                        />

                        <div>
                          <div className="fw-semibold">
                            <span>
                              Posted by{" "}
                              <span>
                                <strong
                                  className="text-primary"
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                  title="Username"
                                >
                                  @{createdBy.username}
                                </strong>{" "}
                                <span
                                  className="text-success"
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                  title="Full Name"
                                >
                                  ({createdBy.fullname})
                                </span>
                              </span>
                            </span>
                          </div>
                          <span
                            className={`badge bg-${badgeColor} text-capitalize`}
                            style={{ fontSize: "0.75rem" }}
                          >
                            {role.replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      {/* Row 2: Note Content */}
                      <div
                        className="mb-3"
                        style={{
                          fontSize: "1.05rem",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {content}
                      </div>

                      {/* Row 3: Time */}
                      <div className="d-flex justify-content-between align-items-center text-white small mt-auto">
                        {/* Left: Edit & Delete buttons */}
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-light"
                            onClick={handleEdit}
                             disabled={currentUserRole === "member"}
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={handleDelete}
                             disabled={currentUserRole !== "project_admin"}
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title="Delete"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>

                        {/* Right: Time and edited status */}
                        <div className="text-end">
                          {formattedTime}
                          {isEdited && (
                            <span className="fst-italic ms-2">(edited)</span>
                          )}
                        </div>
                      </div>
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
