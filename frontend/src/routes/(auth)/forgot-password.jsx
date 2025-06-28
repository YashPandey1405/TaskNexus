import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import Navbar_AboutPage from "../../../Components/Navbar_AboutPage.jsx";
import apiClient from "../../../services/apiClient";
import { authStore } from "../../store/authStore";

export const Route = createFileRoute("/(auth)/forgot-password")({
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
  const [email, setemail] = useState("");
  const [showAlert, setShowAlert] = useState(true);
  const [isPasswordChanged, setisPasswordChanged] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordResetForm, setshowPasswordResetForm] = useState(false);
  const [unHashedToken, setunHashedToken] = useState("");

  useEffect(() => {
    const ForgotPassword = async () => {
      try {
        // Redirect early if not logged in
        if (isLoggedInZustand) {
          console.log("User is not logged in, redirecting to login page...");
          router.navigate({ to: "/home" });
          return; // stop further execution
        }
      } catch (error) {
        setData({
          success: false,
          message: "User Is Logged In. Try again later.",
        });
      }
    };

    ForgotPassword();
  }, [router, isLoggedInZustand]);

  async function handleSubmitFormForEmail(e) {
    e.preventDefault();
    try {
      const ForgotPasswordresponse =
        await apiClient.forgotPasswordRequest(email);
      setData(ForgotPasswordresponse);

      if (ForgotPasswordresponse.success) {
        setshowPasswordResetForm(true);
        setunHashedToken(ForgotPasswordresponse?.data);
      }
    } catch (error) {
      setData({
        success: false,
        message: "Password Change failed in Frontend. Try again later.",
      });
    }
  }

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
          message: "Forgot Password failed in Frontend. Try again later.",
        });
        return;
      }
      const ForgotPasswordDone = await apiClient.forgotPasswordChange(
        formData.password,
        formData.repassword,
        unHashedToken,
      );
      setData(ForgotPasswordDone);

      if (ForgotPasswordDone.success) {
        setTimeout(() => {
          router.navigate({ to: "/login" });
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

  return (
    <div className="container-fluid bg-dark min-vh-100">
      <Navbar_AboutPage />

      {/* The Page Section When User Hasn't Entered The Email For Forgot-Password */}
      {!showPasswordResetForm && (
        <div>
          <div className="container mt-3 mb-5">
            <div className="row justify-content-center">
              <div className="col-md-6 col-lg-5">
                {/* The Form To Input Email */}
                <form onSubmit={handleSubmitFormForEmail}>
                  <label
                    htmlFor="emailInput"
                    className="form-label text-light mb-2"
                  >
                    Enter your email to receive the verification link:
                  </label>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="email"
                      id="emailInput"
                      className="form-control"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setemail(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <hr style={{ borderTop: "2px solid white" }} />

          {/* To Show The Forgot-Password Steps On TaskNexus Platform */}
          <div className="container my-4">
            <div className="p-4 rounded bg-dark text-light shadow">
              <h4 className="mb-3 text-warning">
                🔐 Forgot Password Process - TaskNexus
              </h4>

              <ol className="ps-3">
                <li className="mb-2">
                  <strong>Logged-Out State:</strong> The user must be{" "}
                  <span className="text-danger">logged out</span> to access the
                  forgot password flow.
                </li>

                <li className="mb-2">
                  <strong>Request Page:</strong> On visiting{" "}
                  <code>/forgot-password-request</code>, the user enters their{" "}
                  <strong>registered email</strong> with TaskNexus.
                </li>

                <li className="mb-2">
                  <strong>Email Lookup & Trigger:</strong> If the email exists
                  in the database, a <strong>Forgot Password email</strong> is
                  crafted using <code>Mailgen</code>, then sent via{" "}
                  <code>NodeMailer</code> and <code>Mailtrap</code> to the
                  user’s inbox.
                </li>

                <li className="mb-2">
                  <strong>Secure Reset Form:</strong> The email includes a
                  button that leads to a form where the user can enter:
                  <ul className="ms-3 mt-1">
                    <li>New Password</li>
                    <li>Confirm Password</li>
                  </ul>
                </li>

                <li className="mb-2">
                  <strong>Reset Handling:</strong> On form submission, the user
                  is redirected to <code>/forgot-password-change/:token</code>.
                  If the <code>:token</code> is valid, the password is updated,
                  and the user can then log in with the new password.
                </li>
              </ol>

              <div className="mt-4">
                <h5 className="text-info">📩 Forgot Password Email Preview</h5>
                <div className="text-center">
                  <img
                    src="https://res.cloudinary.com/dah7l8utl/image/upload/v1751123523/Forgot-Password-Email_ajqc1u.png"
                    alt="Forgot Password Email Template"
                    className="img-fluid rounded shadow border border-secondary mt-3"
                    style={{ maxWidth: "100%", height: "600px" }}
                  />
                </div>
              </div>

              <div className="mt-4">
                <span className="badge bg-warning text-dark">
                  If you forgot your password, follow this secure flow to reset
                  it easily.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* The Form Section When The User Will Enter The Password For Reset */}
      {showPasswordResetForm && (
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
      )}
    </div>
  );
}
