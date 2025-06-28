import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import Navbar from "../../../Components/Navbar";
import apiClient from "../../../services/apiClient";
import { authStore } from "../../store/authStore";

export const Route = createFileRoute("/(auth)/showProfile")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const isLoggedInZustand = authStore((state) => state.isLoggedIn);
  const loggedInUserIdZudtand = authStore((state) => state.loggedInUserId);

  const [data, setData] = useState(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        if (!isLoggedInZustand) {
          console.log("User is not logged in, redirecting to login page...");
          router.navigate({ to: "/login" });
          return;
        }

        const response = await apiClient.getCurrentUser(loggedInUserIdZudtand);
        setData(response?.data);
      } catch (error) {
        setData({
          success: false,
          message: "getProjects failed. Try again later.",
        });
      }
    };

    getCurrentUser();
  }, [router, isLoggedInZustand]);

  function verifyEmail() {
    router.navigate({ to: "/verify-email" });
  }

  function changePassword() {
    router.navigate({ to: "/change-password" });
  }

  return (
    <div className="container-fluid bg-dark text-light min-vh-100">
      <Navbar />
      <div className="py-2 px-3">
        {/* Loading Spinner */}
        {!data ? (
          <div className="text-center my-5">
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Profile Card */}
            <div className="row justify-content-center mb-5">
              <div className="col-12 col-md-10 col-lg-8 col-xl-6">
                <div
                  className="card text-white border-0 shadow-lg rounded-4 overflow-hidden"
                  style={{
                    background: "linear-gradient(145deg, #1e1e2f, #2c2c3e)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <div className="card-body text-center p-5">
                    <div className="mb-4 position-relative d-inline-block">
                      <img
                        src={data?.existingUser.avatar.url}
                        alt="Profile Avatar"
                        className="rounded-circle border border-4 border-secondary shadow"
                        style={{
                          width: "140px",
                          height: "140px",
                          objectFit: "cover",
                        }}
                      />
                      {!data?.existingUser.isEmailVerified ? (
                        <button
                          onClick={verifyEmail}
                          className="position-absolute bottom-0 end-0 translate-middle p-2 border border-light rounded-circle bg-warning"
                          title="Email Not Verified"
                          style={{ border: "none", background: "none" }}
                        >
                          <i className="fas fa-exclamation text-dark"></i>
                        </button>
                      ) : (
                        <span
                          className="position-absolute bottom-0 end-0 translate-middle p-2 border border-light rounded-circle bg-success"
                          title="Verified Email"
                        >
                          <i className="fas fa-check text-white"></i>
                        </span>
                      )}
                    </div>
                    <h3 className="fw-bold mb-0">
                      {data?.existingUser.fullname}
                    </h3>
                    <p className="text-secondary">
                      @{data?.existingUser.username}
                    </p>
                    <p className="mb-3">
                      <i className="fas fa-envelope me-2 text-white-50"></i>
                      <span className="text-white-50">
                        {data?.existingUser.email}
                      </span>
                    </p>
                    <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-3 mt-3">
                      {/* Email verification button */}
                      {!data?.existingUser.isEmailVerified ? (
                        <button
                          onClick={verifyEmail}
                          className="btn btn-warning w-100 w-md-auto"
                        >
                          Verify Your Email &nbsp;
                          <i className="fas fa-exclamation text-dark"></i>
                        </button>
                      ) : (
                        <button className="btn btn-success w-100 w-md-auto">
                          <i className="fas fa-check text-white me-2"></i> Email
                          Verified
                        </button>
                      )}

                      {/* Change password button */}
                      <button
                        className="btn btn-warning w-100 w-md-auto"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to change the password?",
                            )
                          ) {
                            changePassword();
                          }
                        }}
                      >
                        <i className="fas fa-key me-2"></i>
                        Change Password
                      </button>
                    </div>

                    <hr className="border-secondary" />
                    <div className="d-flex justify-content-around text-white-50">
                      <div>
                        <i className="fas fa-calendar-alt me-2"></i>
                        <span>
                          Joined:{" "}
                          {new Date(
                            data?.existingUser.createdAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <i className="fas fa-edit me-2"></i>
                        <span>
                          Updated:{" "}
                          {new Date(
                            data?.existingUser.updatedAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Table */}
            <div className="row justify-content-center">
              <div className="col-12 col-lg-10">
                <div className="card bg-dark text-white shadow-lg rounded-4 border border-secondary">
                  <div className="card-header border-bottom border-secondary bg-dark px-4 py-3">
                    <h4 className="fw-bold text-white m-0">
                      <i className="fas fa-diagram-project me-2"></i>
                      Associated Projects
                    </h4>
                  </div>
                  <div className="card-body px-3">
                    {data?.allAssociatedProject.length === 0 ? (
                      <p className="text-muted">No projects found.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover table-bordered align-middle mb-0 text-center">
                          <thead className="table-light text-dark">
                            <tr>
                              <th>Project</th>
                              <th>Description</th>
                              <th>Role</th>
                              <th>Associated Tasks</th>
                              <th>Associated Sub-Tasks</th>
                              <th>Associated Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data?.allAssociatedProject.map((member) => {
                              let rowClass = "";
                              switch (member.role) {
                                case "project_admin":
                                  rowClass = "table-primary text-dark";
                                  break;
                                case "admin":
                                  rowClass = "table-warning text-dark";
                                  break;
                                case "member":
                                  rowClass = "table-success text-dark";
                                  break;
                                default:
                                  rowClass = "";
                              }

                              return (
                                <tr key={member._id} className={rowClass}>
                                  <td className="fw-semibold">
                                    {member.project.name}
                                  </td>
                                  <td className="text-muted small">
                                    {member.project.description}
                                  </td>
                                  <td className="text-capitalize">
                                    {member.role.replace("_", " ")}
                                  </td>
                                  <td>{member.totalAssociatedTasks}</td>
                                  <td>{member.totalAssociatedSubTasks}</td>
                                  <td>{member.totalAssociatedNotes}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
