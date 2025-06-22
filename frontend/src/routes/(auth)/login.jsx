import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import apiClient from "../../../services/apiClient";
import { authStore } from "../../store/authStore.js";

export const Route = createFileRoute("/(auth)/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();

  const isLoggedInZustand = authStore((state) => state.isLoggedIn);
  const loginUserZustand = authStore((state) => state.loginUser);

  useEffect(() => {
    if (isLoggedInZustand) {
      console.log("User already logged in. Redirecting to /home...");
      router.navigate({ to: "/home" });
    }
  }, [isLoggedInZustand, router]);

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [data, setData] = useState(null);
  const [showAlert, setShowAlert] = useState(true);
  const [useSample, setUseSample] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setShowAlert(true);

    try {
      const loginUser = await apiClient.login(
        formData.email,
        formData.username,
        formData.password,
      );
      setData(loginUser);
      console.log("Login response:", loginUser);

      if (loginUser.success) {
        let userId = loginUser.data._id;
        loginUserZustand(userId);
        console.log("User logged in:", authStore.getState());

        setTimeout(() => {
          router.navigate({ to: "/home" });
        }, 3000);
      }
    } catch (error) {
      setData({
        success: false,
        message: "Login failed in Frontend. Try again later.",
      });
    }

    setIsLoggingIn(false);
  };

  const handleSampleToggle = (e) => {
    const checked = e.target.checked;
    setUseSample(checked);

    setFormData(
      checked
        ? {
            email: "sample123@gmail.com",
            username: "sampleuser",
            password: "sampleuser",
          }
        : { email: "", username: "", password: "" },
    );
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
          <h2 className="text-center mb-4">Log In to TaskNexus</h2>
          <p>isLoggedInZustand : {isLoggedInZustand}</p>

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
                value={formData.email}
                onChange={handleChange}
                required
                readOnly={useSample}
                autoComplete="email"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                readOnly={useSample}
                autoComplete="username"
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                readOnly={useSample}
                autoComplete="current-password"
              />
            </div>

            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="sampleAccount"
                checked={useSample}
                onChange={handleSampleToggle}
              />
              <label className="form-check-label" htmlFor="sampleAccount">
                Use sample account
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mb-2"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Logging in..." : "Login"}
            </button>

            <Link
              to="/signup"
              className="btn btn-outline-warning w-75 mx-auto d-block mt-3 text-center"
            >
              Don’t have an account? <strong>Sign Up</strong>
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
