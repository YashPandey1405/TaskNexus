import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useRouter, Link } from "@tanstack/react-router";
import Navbar from "../../../Components/Navbar";
import apiClient from "../../../services/apiClient";
import { authStore } from "../../store/authStore";

import {
  FaEnvelope,
  FaUserCheck,
  FaUserClock,
  FaCalendarAlt,
  FaEdit,
} from "react-icons/fa";

export const Route = createFileRoute("/(auth)/showProfile")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const isLoggedInZustand = authStore((state) => state.isLoggedIn);
  const loggedInUserIdZudtand = authStore((state) => state.loggedInUserId);

  const [data, setData] = useState(null);
  const [showAlert, setShowAlert] = useState(true);
  const [projectDelete, setprojectDelete] = useState(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        // Redirect early if not logged in
        if (!isLoggedInZustand) {
          console.log("User is not logged in, redirecting to login page...");
          router.navigate({ to: "/login" });
          return; // stop further execution
        }

        const response = await apiClient.getCurrentUser(loggedInUserIdZudtand);
        setData(response?.data);

        if (!response.success) {
          console.log("Valid Data is Been receved.....");
        }

        console.log(response);
      } catch (error) {
        setData({
          success: false,
          message: "getProjects failed. Try again later.",
        });
      }
    };

    getCurrentUser();
  }, [router, isLoggedInZustand]);

  return (
    <div>
      <div className="container-fluid bg-dark text-light min-vh-100 py-5 px-3">
        <Navbar />
        {/* Profile Card */}
        <div className="row justify-content-center mb-5">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card text-light shadow-lg rounded-4 p-4 bg-dark bg-opacity-75 border border-light">
              <div className="text-center">
                <img
                  src={data?.existingUser.avatar.url}
                  alt="Profile Avatar"
                  className="rounded-circle shadow border border-3 border-light mb-4"
                  style={{
                    width: "140px",
                    height: "140px",
                    objectFit: "cover",
                  }}
                />
                <h3 className="fw-bold mb-1">{data?.existingUser.fullname}</h3>
                <p className="text-muted mb-2">
                  @{data?.existingUser.username}
                </p>
                <p className="mb-2">
                  <FaEnvelope className="me-2" />
                  {data?.existingUser.email}
                </p>
                <span
                  className={`badge px-3 py-2 fs-6 rounded-pill ${
                    data?.existingUser.isEmailVerified
                      ? "bg-success"
                      : "bg-warning text-dark"
                  }`}
                >
                  {data?.existingUser.isEmailVerified ? (
                    <>
                      <FaUserCheck className="me-1" />
                      Email Verified
                    </>
                  ) : (
                    <>
                      <FaUserClock className="me-1" />
                      Email Not Verified
                    </>
                  )}
                </span>
                <hr className="my-4 border-light" />
                <p className="small text-muted mb-1">
                  <FaCalendarAlt className="me-2" />
                  Joined:{" "}
                  {new Date(data?.existingUser.createdAt).toLocaleDateString()}
                </p>
                <p className="small text-muted">
                  <FaEdit className="me-2" />
                  Last Updated:{" "}
                  {new Date(data?.existingUser.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Project Table */}
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="card text-light shadow-lg rounded-4 bg-dark bg-opacity-75 border border-light">
              <div className="card-header border-bottom border-light px-4 py-3">
                <h5 className="mb-0 fw-semibold">Associated Projects</h5>
              </div>
              <div className="card-body px-3">
                {data?.allAssociatedProject.length === 0 ? (
                  <p className="text-muted">No projects found.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-dark table-hover table-bordered align-middle mb-0">
                      <thead className="table-light text-dark">
                        <tr>
                          <th>Project</th>
                          <th>Description</th>
                          <th>Role</th>
                          <th>Tasks</th>
                          <th>Sub-Tasks</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.allAssociatedProject.map((member) => (
                          <tr key={member._id}>
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
