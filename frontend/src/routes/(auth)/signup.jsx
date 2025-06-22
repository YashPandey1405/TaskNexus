import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import apiClient from "../../../services/apiClient";

export const Route = createFileRoute("/(auth)/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    fullname: "",
    username: "",
    password: "",
  });
  const [data, setData] = useState(null);
  const [showAlert, setShowAlert] = useState(true);
  const [isSigningIn, setisSigningIn] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setisSigningIn(true);
    setShowAlert(true);

    try {
      const signupUser = await apiClient.signup(
        formData.email,
        formData.username,
        formData.fullname,
        formData.password,
      );
      setData(signupUser);

      if (signupUser.success) {
        setTimeout(() => {
          router.navigate({ to: "/home" });
        }, 3000);
      }
    } catch (error) {
      setData({ success: false, message: "Signup failed. Try again later." });
    }

    setisSigningIn(false);
  };

  return (
    <div className="bg-dark text-light min-vh-100">
      <div className="container d-flex align-items-center justify-content-center vh-100">
        <div
          className="card p-4 shadow-lg"
          style={{
            maxWidth: "600px",
            width: "100%",
            borderRadius: "25px",
            backgroundColor: "#1f1f1f",
            color: "#ffffff",
          }}
        >
          <h2 className="text-center mb-4">Sign Up to TaskNexux</h2>
          {data && showAlert && (
            <div
              className={`alert ${
                data.success ? "alert-success" : "alert-danger"
              } alert-dismissible fade show`}
              role="alert"
            >
              {data.message}
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setShowAlert(false)}
              ></button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                User Name
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                placeholder="Enter your username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="fullname" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter your full name"
                id="fullname"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Enter your password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mb-2"
              disabled={isSigningIn}
            >
              {isSigningIn ? "Signing in..." : "Sign In"}
            </button>

            <Link
              to="/login"
              className="btn btn-outline-warning w-75 mx-auto d-block mt-3 text-center"
            >
              Already have an account? <strong>Log In</strong>
            </Link>
            <Link
              to="/forgot-password"
              className="btn btn-outline-info w-75 mx-auto d-block mt-3 text-center"
            >
              Forgot your password? <strong>Reset it here</strong>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
