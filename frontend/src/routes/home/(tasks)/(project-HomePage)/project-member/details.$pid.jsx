import React, { useState, useEffect } from "react";
import { Tooltip } from "bootstrap";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import Navbar from "../../../../../../Components/Navbar";
import apiClient from "../../../../../../services/apiClient";
import { authStore } from "../../../../../store/authStore";

export const Route = createFileRoute(
  "/home/(tasks)/(project-HomePage)/project-member/details/$pid",
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

  // UseEffect to fetch project members data and the Related Tasks Of The Project.....
  useEffect(() => {
    const getTheProjects = async () => {
      try {
        if (!isLoggedInZustand) {
          console.log("User is not logged in, redirecting to login page...");
          router.navigate({ to: "/login" });
          return;
        }

        const response = await apiClient.getProjectMembers(pid);

        setapiresponse(response.data);

        const tooltipTriggerList = document.querySelectorAll(
          '[data-bs-toggle="tooltip"]',
        );
        tooltipTriggerList.forEach((el) => new Tooltip(el));
        if (response.success) {
          console.log("Project Members data fetched successfully:", response);
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

  const currentLoggedInUser = apiresponse?.currentProjectMembers?.find(
    (member) => member?.user?._id === loggedInUserIdZustand,
  );
  console.log("currentLoggedInUser: ", currentLoggedInUser);

  function handleAddProjectMember() {
    router.navigate({ to: `/home/project-member/create/${pid}` });
  }

  async function handleDeleteMember(projectMemberID) {
    try {
      const response = await apiClient.deleteProjectMember(projectMemberID);
      if (response.success) {
        setTimeout(() => {
          window.location.reload();
        }, 3000); // 3000 ms = 3 seconds
      }
    } catch (error) {
      router.navigate({ to: `/home` });
    }
  }

  return (
    <div className="bg-dark min-vh-100">
      <Navbar />
      <div className="text-light rounded mx-4 mt-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center px-3 mb-4">
          <h5 className="text-light mb-3 mb-md-0">
            👋 Welcome to{" "}
            <strong className="text-primary">
              "{apiresponse?.currentProject?.name}"
            </strong>{" "}
            — a project crafted by{" "}
            <strong className="text-success">
              {apiresponse?.currentProject?.createdBy?.username}
            </strong>
            &nbsp;on{" "}
            <span className="text-warning">
              {new Date(apiresponse?.currentProject?.createdAt).getDate()}{" "}
              {new Date(apiresponse?.currentProject?.createdAt).toLocaleString(
                "default",
                { month: "long" },
              )}{" "}
              {new Date(apiresponse?.currentProject?.createdAt).getFullYear()}{" "}
              at{" "}
              {new Date(
                apiresponse?.currentProject?.createdAt,
              ).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </h5>

          <button
            className="btn btn-outline-light px-4 py-2"
            onClick={handleAddProjectMember}
          >
            + Add Member
          </button>
        </div>

        {/* Table To Display List On The Frontend */}
        <table className="table table-bordered table-hover text-light table-striped mt-2">
          <thead className="table-dark">
            <tr>
              <th>Member Username</th>
              <th>Member Full Name</th>
              <th>Member Role</th>
              <th>Joined On</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apiresponse?.currentProjectMembers
              ?.slice()
              .sort((a, b) => {
                const rolePriority = {
                  project_admin: 1,
                  admin: 2,
                  member: 3,
                };
                return rolePriority[a.role] - rolePriority[b.role];
              })
              .map((member) => {
                const { _id, user, role, createdAt } = member;

                const rowClass =
                  role === "project_admin"
                    ? "table-danger" // 🔴 Bold red — ultimate authority
                    : role === "admin"
                      ? "table-primary" // 🔵 Strong blue — trusted role
                      : "table-success"; // 🟢 Green — friendly member

                return (
                  <tr key={_id} className={rowClass}>
                    <td className="fw-bold">
                      {user?._id === loggedInUserIdZustand ? (
                        <span
                          className="text-success fw-bold"
                          style={{ fontSize: "1.05rem" }}
                        >
                          👤 You
                        </span>
                      ) : (
                        user?.username
                      )}
                    </td>
                    <td>{user?.fullname || "N/A"}</td>
                    <td className="text-capitalize">
                      {role.replace("_", " ")}
                    </td>
                    <td className="fw-semibold">
                      {new Date(createdAt)
                        .toLocaleString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                        .replace(",", " at")}
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-info btn-sm me-2 px-3 py-2"
                        // Project_Admin Can Edit Anyone's Role
                        // Admin & Member can't Update An Member.....
                        disabled={currentLoggedInUser?.role !== "project_admin"}
                        onClick={() => handleEditMember(_id)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm px-3 py-2"
                        // Project_Admin Can Delete Anyone's Role
                        // Admin & Member can't Delete An Member.....
                        disabled={currentLoggedInUser?.role !== "project_admin"}
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to remove this member?",
                            )
                          ) {
                            handleDeleteMember(_id);
                          }
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
