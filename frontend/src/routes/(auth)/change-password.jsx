import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import Navbar from "../../../Components/Navbar.jsx";
import { Link } from "@tanstack/react-router";
import apiClient from "../../../services/apiClient";
import { authStore } from "../../store/authStore.js";

export const Route = createFileRoute("/(auth)/change-password")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();

  const isLoggedInZustand = authStore((state) => state.isLoggedIn);
  const loggedInUserIdZudtand = authStore((state) => state.loggedInUserId);

  const [formData, setFormData] = useState({
    password: "",
    repassword: "",
  });
  const [data, setData] = useState(null);
  const [showAlert, setShowAlert] = useState(true);
  const [isPasswordChanged, setisPasswordChanged] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setisPasswordChanged(true);
    setShowAlert(true);

    try {
      if (formData.password !== formData.repassword) {
        setData({
          success: false,
          message: "Project Creation failed in Frontend. Try again later.",
        });
        return;
      }
      const projectCreated = await apiClient.changePassword(
        formData.password,
        formData.repassword,
      );
      setData(projectCreated);

      if (projectCreated.success) {
        setTimeout(() => {
          router.navigate({ to: "/showProfile" });
        }, 3000);
      }
    } catch (error) {
      setData({
        success: false,
        message: "Password Change failed in Frontend. Try again later.",
      });
    }

    setisPasswordChanged(false);
  };

  useEffect(() => {
    const changePassword = async () => {
      try {
        // Redirect early if not logged in
        if (!isLoggedInZustand) {
          console.log("User is not logged in, redirecting to login page...");
          router.navigate({ to: "/login" });
          return; // stop further execution
        }
      } catch (error) {
        setData({
          success: false,
          message: "User Not Logged In failed. Try again later.",
        });
      }
    };

    changePassword();
  }, [router, isLoggedInZustand]);

  return (
    <div className="bg-dark text-light min-vh-100 d-flex flex-column">
      <Navbar />

      {/* Welcome Banner */}
      {/* <div className="container pt-4">
        <div className="row justify-content-center">
          <div className="col-auto text-center">
            <h2 className="fw-semibold">
              👋 Hello, Welcome to{" "}
              <span className="text-warning">TaskNexus</span> Platform
            </h2>
          </div>
        </div>
      </div> */}

      {/* Form Section */}
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
            Change Your Password 🔒
          </h2>

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

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Password Input */}
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Enter The New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control bg-dark text-light border-secondary"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter Your New Password...."
              />
            </div>

            {/* Re-Password Input */}
            <div className="mb-3">
              <label htmlFor="repassword" className="form-label">
                Re-Enter The New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control bg-dark text-light border-secondary"
                id="repassword"
                name="repassword"
                value={formData.repassword}
                onChange={handleChange}
                required
                placeholder="Re-Enter Your New Password...."
              />
            </div>

            {/* Toggle Password Visibility */}
            <button
              type="button"
              className="btn btn-sm btn-outline-light mt-2 mb-3"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              <i
                className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} me-2`}
              ></i>
              {showPassword ? "Hide Password" : "Show Password"}
            </button>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isPasswordChanged}
            >
              {isPasswordChanged ? "Changing Password..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
