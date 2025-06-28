import React, { useState, useEffect } from "react";
import { Tooltip } from "bootstrap";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import Navbar from "../../../../../../Components/Navbar";
import apiClient from "../../../../../../services/apiClient";
import { authStore } from "../../../../../store/authStore";

export const Route = createFileRoute(
  "/home/(tasks)/(project-HomePage)/project-member/update/$pmid",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const { pmid } = Route.useParams();

  const [formData, setFormData] = useState({
    member: "",
    role: "",
  });

  const [data, setData] = useState(null);
  const [MemberList, setMemberList] = useState(null);
  const [formdatavalues, setformdatavalues] = useState(null);
  const [showAlert, setShowAlert] = useState(true);
  const [isMemberUpdated, setisMemberUpdated] = useState(false);

  const isLoggedInZustand = authStore((state) => state.isLoggedIn);
  const loggedInUserIdZustand = authStore((state) => state.loggedInUserId);
  let availableRolesForCreation = [];

  // UseEffect to fetch project members data and the Related Tasks Of The Project.....
  useEffect(() => {
    const getTheProjectMember = async () => {
      try {
        if (!isLoggedInZustand) {
          console.log("User is not logged in, redirecting to login page...");
          router.navigate({ to: "/login" });
          return;
        }

        const response = await apiClient.getProjectMemberByID(pmid);

        if (response.success) {
          setMemberList(response.data);
        }
      } catch (error) {
        setData({
          success: false,
          message: "User Not Logged In failed. Try again later.",
        });
      }
    };

    getTheProjectMember();
  }, [router, isLoggedInZustand]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setisMemberUpdated(true);
    setShowAlert(true);

    try {
      const projectUpdation = await apiClient.UpdateProjectMember(
        formData.role,
        pmid,
      );
      setData(projectUpdation);

      if (projectUpdation.success) {
        const pid = projectUpdation?.data?.project;
        // console.log(pid);
        setTimeout(() => {
          router.navigate({ to: `/home/project-member/details/${pid}` });
        }, 3000);
      }
    } catch (error) {
      setData({
        success: false,
        message: "Project Member Updation failed in Frontend. Try again later.",
      });
    }

    setisMemberUpdated(false);
  };

  //   Use Effect To Ensure That Only Project_Admin Can Edit The Project Admin
  useEffect(() => {
    const currentLoggedInUserRole = MemberList?.currentLoggedInUserRole?.role;

    if (
      currentLoggedInUserRole &&
      currentLoggedInUserRole !== "project_admin"
    ) {
      router.navigate({ to: "/home" });
    }
    const AddedByMember = `${MemberList?.requestedProjectMember?.user?.username} (${MemberList?.requestedProjectMember?.role})`;
    formData.member = AddedByMember;
  }, [MemberList]);

  if (MemberList?.requestedProjectMember?.role === "admin") {
    availableRolesForCreation.push("member");
  } else {
    availableRolesForCreation.push("admin");
  }
  //   console.log("AddedByMember", AddedByMember);
  //   console.log("availableRolesForCreation", availableRolesForCreation);

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
              Update An Project Member
            </h2>
            {/* <p>{formData.userID}</p>
            <p>{formData.role}</p> */}

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
              {/* Added To Project By Field */}
              <div className="mb-3">
                <label htmlFor="AddedBy" className="form-label">
                  Current Project Member & Role
                </label>
                <input
                  type="text"
                  className="form-control bg-dark text-light border-secondary"
                  id="AddedBy"
                  name="AddedBy"
                  value={formData.member}
                  readOnly
                />
              </div>

              {/* new Project Member Role */}
              <div className="mb-4">
                <label htmlFor="role" className="form-label">
                  New Project Member Role
                </label>
                <select
                  className="form-select bg-dark text-light border-secondary"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select a user role --</option>
                  {availableRolesForCreation.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>

                {/* 🔽 Helper Text Below */}
                <div className="form-text text-secondary mt-1">
                  • Members are not allowed to add new project members. <br />•
                  Admins can only add members with the <strong>member</strong>{" "}
                  role. <br />• Only Project Admins can assign both{" "}
                  <strong>member</strong> and <strong>admin</strong> roles.
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={isMemberUpdated}
              >
                {isMemberUpdated ? "Updating Member..." : "Update Member Role"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
