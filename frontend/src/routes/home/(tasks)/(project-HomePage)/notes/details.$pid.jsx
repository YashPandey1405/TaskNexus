import React, { useState, useEffect } from "react";
import { Tooltip } from "bootstrap";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import Navbar from "../../../../../../Components/Navbar";
import apiClient from "../../../../../../services/apiClient";
import { authStore } from "../../../../../store/authStore";
import ModalForm from "../../../../../../Components/ModalForm";

export const Route = createFileRoute(
  "/home/(tasks)/(project-HomePage)/notes/details/$pid",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const { pid } = Route.useParams();
  console.log("Project ID from params:", pid);

  const [data, setData] = useState(null);
  const [apiresponse, setapiresponse] = useState(null);
  const [content, setcontent] = useState("");
  const [showAlert, setShowAlert] = useState(true);
  const [isNoteCreated, setisNoteCreated] = useState(false);
  const [editNoteId, setEditNoteId] = useState(null);
  const [editContent, setEditContent] = useState("");

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

    getTheNotesData();
  }, [router, isLoggedInZustand]);

  // Color Pallete Based On The Note Creator Role......
  const roleBadgeColors = {
    project_admin: "danger",
    member: "primary",
    viewer: "secondary",
  };

  currentUserRole = apiresponse?.currentUserRole;

  function handleGetBackPage() {
    router.navigate({ to: `/home/project/${pid}` });
  }

  const handleCreateNote = async (e) => {
    e.preventDefault();
    setisNoteCreated(true);

    try {
      const NoteCreation = await apiClient.createProjectNote(content, pid);
      setData(NoteCreation);

      if (NoteCreation.success) {
        setisNoteCreated(false);
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      setData({
        success: false,
        message: "Note Creation failed in Frontend. Try again later.",
      });
    }
  };

  async function handleEdit(noteID, editContent) {
    try {
      const NoteUpdation = await apiClient.UpdateProjectNote(
        editContent,
        pid,
        noteID,
      );
      setData(NoteUpdation);

      if (NoteUpdation.success) {
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      setData({
        success: false,
        message: "Note Deletion failed in Frontend. Try again later.",
      });
    }
  }

  const handleDelete = async (noteID) => {
    try {
      const NoteDeletion = await apiClient.DeleteProjectNote(pid, noteID);
      setData(NoteDeletion);

      if (NoteDeletion.success) {
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      setData({
        success: false,
        message: "Note Deletion failed in Frontend. Try again later.",
      });
    }
  };

  return (
    <div className="container-fluid bg-dark text-light min-vh-100">
      <Navbar />
      <div className="pb-4 px-3">
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
        {/* Centered Welcome Text */}
        <div className="row align-items-center mb-4 pb-3">
          <div className="col-auto">
            <button className="btn btn-primary" onClick={handleGetBackPage}>
              &lt;Back
            </button>
          </div>
          <div className="col text-center fw-semibold fs-5">
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
        </div>

        <>
          {/* Members Are Not Allowed To Create An Project Note */}
          {/* 
              React doesn't support styling pseudo-elements like ::placeholder through inline styles.
              Although we can set text color via `style={{ color: "#fff" }}`, it affects only the input value, 
              NOT the placeholder text.

              By default, browsers render ::placeholder with `opacity: 0.5`, and since we are using a dark theme
              (bg-dark + text-white), the white placeholder becomes nearly invisible due to reduced opacity.

              Therefore, we insert a scoped <style> block inside the component to directly target the 
              placeholder using the input's ID and set:
              - color: a visible light gray (`#ccc`)
                - opacity: 1 (fully visible)
                
                This approach avoids needing a separate CSS file while still fixing the visibility issue.
        */}
        </>
        <>
          <style>
            {`#create::placeholder { color: #ccc !important; opacity: 1; }`}
          </style>
          <form
            onSubmit={handleCreateNote}
            className="border-bottom border-secondary mb-4"
          >
            <div className="row">
              <div className="col-10 mb-3">
                <input
                  type="text"
                  id="create"
                  name="create"
                  className="form-control bg-dark text-white border-secondary"
                  placeholder={
                    currentUserRole === "member"
                      ? "Only Admin & Project-Admin Can Create An Note"
                      : "Create a descriptive note for this project"
                  }
                  value={content}
                  onChange={(e) => setcontent(e.target.value)}
                  disabled={currentUserRole === "member"}
                  required
                />
              </div>
              <div className="col">
                <button
                  className="btn btn-primary me-2"
                  disabled={currentUserRole === "member" || isNoteCreated}
                  type="submit"
                >
                  {isNoteCreated ? "Creating Note..." : "Create Note"}
                </button>
              </div>
            </div>
          </form>
        </>

        {apiresponse?.allProjectNotes?.length === 0 ? (
          <p className="text-muted text-center">No notes found.</p>
        ) : (
          <div className="row g-4">
            {apiresponse?.allProjectNotes?.map((note) => {
              const { _id, content, createdAt, updatedAt, createdBy, role } =
                note;
              const isEdited = createdAt !== updatedAt;
              const badgeColor = roleBadgeColors[role] || "secondary";

              const formatDate = (isoString) => {
                const date = new Date(isoString);
                const day = date.getDate();
                const month = date.toLocaleString("default", { month: "long" });
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
                      className="card-body d-flex flex-column justify-content-between"
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
                            border: "2px solid #555",
                            boxShadow: "0 0 0 3px #ffc107",
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

                      {/* Row 2: Note Content OR Editable Textarea */}
                      <div
                        className="mb-3"
                        style={{ fontSize: "1.05rem", whiteSpace: "pre-wrap" }}
                      >
                        {editNoteId === _id ? (
                          <>
                            <textarea
                              className="form-control bg-dark text-light border-secondary mb-2"
                              rows="3"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                            ></textarea>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => {
                                  handleEdit(_id, editContent);
                                  setEditNoteId(null);
                                }}
                              >
                                Save
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => setEditNoteId(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </>
                        ) : (
                          content
                        )}
                      </div>

                      {/* Row 3: Time and Buttons */}
                      <div className="d-flex justify-content-between align-items-center text-white small mt-auto">
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-light"
                            onClick={() => {
                              setEditNoteId(_id);
                              setEditContent(content);
                            }}
                            disabled={
                              createdBy._id != loggedInUserIdZustand &&
                              currentUserRole !== "project_admin"
                            }
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this note?",
                                )
                              ) {
                                handleDelete(_id);
                              }
                            }}
                            disabled={currentUserRole !== "project_admin"}
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title="Delete"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>

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
