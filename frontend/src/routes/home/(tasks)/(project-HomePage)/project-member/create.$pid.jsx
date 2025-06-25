import React, { useState, useEffect } from "react";
import { Tooltip } from "bootstrap";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import Navbar from "../../../../../../Components/Navbar";
import apiClient from "../../../../../../services/apiClient";
import { authStore } from "../../../../../store/authStore";

export const Route = createFileRoute(
  "/home/(tasks)/(project-HomePage)/project-member/create/$pid",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const { pid } = Route.useParams();
  console.log("Project ID from params:", pid);

  const [formData, setFormData] = useState({
    userID: "",
    role: "",
  });

  const [data, setData] = useState(null);
  const [MemberList, setMemberList] = useState(null);
  const [formdatavalues, setformdatavalues] = useState(null);
  const [showAlert, setShowAlert] = useState(true);
  const [isMemberCreated, setisMemberCreated] = useState(false);

  const isLoggedInZustand = authStore((state) => state.isLoggedIn);
  const loggedInUserIdZustand = authStore((state) => state.loggedInUserId);

  // UseEffect to fetch project members data and the Related Tasks Of The Project.....
  useEffect(() => {
    const getTheProjectMemberList = async () => {
      try {
        if (!isLoggedInZustand) {
          console.log("User is not logged in, redirecting to login page...");
          router.navigate({ to: "/login" });
          return;
        }

        const response = await apiClient.getProjectMembersList(pid);

        if (response.success) {
          setMemberList(response.data);
        }
      } catch (error) {
        setapiData({
          success: false,
          message: "User Not Logged In failed. Try again later.",
        });
      }
    };

    getTheProjectMemberList();
  }, [router, isLoggedInZustand]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setisMemberCreated(true);
    setShowAlert(true);

    try {
      console.log("Form Data before API call:", formData);
      const projectUpdation = await apiClient.createProjectMember(
        formData.userID,
        formData.role,
        pid,
      );
      setData(projectUpdation);
      console.log("Project Member Created response:", projectUpdation);

      if (projectUpdation.success) {
        setTimeout(() => {
          router.navigate({ to: `/home/project-member/details/${pid}` });
        }, 3000);
      }
    } catch (error) {
      setData({
        success: false,
        message: "Task Creation failed in Frontend. Try again later.",
      });
    }

    setisMemberCreated(false);
  };

  // Logic To Get Users Which Are Not Part Of The Current Project
  // Step 1: Get a Set of user IDs who are already project members
  const memberUserIds = new Set(
    MemberList?.allCurrentProjectMembers?.map((member) =>
      member?.user?._id.toString(),
    ),
  );

  // Step 2: Filter out those users from allUsersInDatabase
  const nonProjectUsers = MemberList?.allUsersInDatabase?.filter(
    (user) => !memberUserIds.has(user?._id.toString()),
  );

  //   console.log("The Non Project Users Are :: ", nonProjectUsers);

  const currentUserInProject = MemberList?.allCurrentProjectMembers.find(
    (member) => member.user._id.toString() === loggedInUserIdZustand,
  );
  const AddedByMember = `${currentUserInProject?.user?.username} (${currentUserInProject?.role})`;

  //   Security Check : Member Can't Add Any Project Member........
  if (currentUserInProject?.role === "member") {
    router.navigate({ to: `/home/project/${pid}` });
  }
  const availableRolesForCreation =
    currentUserInProject?.role === "project_admin"
      ? ["member", "admin"]
      : ["member"];

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
              Create An Project Member
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
                  Added To Project By
                </label>
                <input
                  type="text"
                  className="form-control bg-dark text-light border-secondary"
                  id="AddedBy"
                  name="AddedBy"
                  value={AddedByMember}
                  readOnly
                />
              </div>

              {/* Project Member Creator Field */}
              <div className="mb-3">
                <label htmlFor="userID" className="form-label">
                  New Project Member
                </label>
                <select
                  className="form-select bg-dark text-light border-secondary"
                  id="userID"
                  name="userID"
                  value={formData.userID}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled hidden>
                    -- Select a user --
                  </option>

                  {nonProjectUsers?.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.username}
                    </option>
                  ))}
                </select>
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
                disabled={isMemberCreated}
              >
                {isMemberCreated ? "Creating Member..." : "Create New Member"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
