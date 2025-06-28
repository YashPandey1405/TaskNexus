import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import Navbar from "../../../Components/Navbar";
import apiClient from "../../../services/apiClient";
import { authStore } from "../../store/authStore";

export const Route = createFileRoute("/(auth)/verify-email")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();

  const [data, setData] = useState(null);
  const [VerifyURL, setVerifyURL] = useState("");
  const isLoggedInZustand = authStore((state) => state.isLoggedIn);
  const loggedInUserIdZudtand = authStore((state) => state.loggedInUserId);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (!isLoggedInZustand) {
          console.log("User is not logged in, redirecting to login page...");
          router.navigate({ to: "/login" });
          return;
        }

        const response = await apiClient.resendEmailVerificationToken();

        if (response.success) {
          console.log(response.data);
          setVerifyURL(response?.data);
        }
      } catch (error) {
        setData({
          success: false,
          message: "Verify-Email failed. Try again later.",
        });
      }
    };

    verifyEmail();
  }, [router, isLoggedInZustand]);

  // Function To verify Email....
  async function verifyUserEmail() {
    try {
      console.log("VerifyURL: ", VerifyURL);
      const verificationStatus = await apiClient.verifyEmail(VerifyURL);
      setData(verificationStatus);
      console.log("verificationStatus response:", verificationStatus);

      if (verificationStatus.success) {
        setTimeout(() => {
          router.navigate({ to: "/showProfile" });
        }, 1000);
      }
    } catch (error) {
      setData({
        success: false,
        message: "Login failed in Frontend. Try again later.",
      });
    }
  }

  return (
    <div className="bg-dark">
      <Navbar />
      <div className="container my-4">
        <div className="p-4 rounded bg-dark text-light shadow">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h4 className="text-info mb-0">
              📧 Email Verification Process - TaskNexus
            </h4>
            <button
              className="btn btn-outline-primary"
              onClick={verifyUserEmail}
            >
              Verify Email
            </button>
          </div>

          <ol className="ps-3">
            <li className="mb-2">
              <strong>Login Required:</strong> The user must be logged in.
              Otherwise, they will be redirected to <code>/login</code>.
            </li>
            <li className="mb-2">
              <strong>Email Check:</strong> If the email is not verified, the
              user will be redirected to <code>/verify-email</code>.
            </li>
            <li className="mb-2">
              <strong>Verification Mail:</strong> A verification email is
              crafted using <code>Mailgen</code>, sent via{" "}
              <code>NodeMailer</code> and <code>Mailtrap</code> to the user’s
              email.
            </li>
            <li className="mb-2">
              <strong>Final Step:</strong> On clicking the button in the email,
              the user will be redirected to the verification URL{" "}
              <code>/auth/verify-email/:token</code>. If the token is valid, the
              email gets verified and the user is redirected to their profile
              page.
            </li>
          </ol>

          <div className="mt-4">
            <h5 className="text-info mb-2">📨 Verification Email Preview</h5>
            <div className="text-center">
              <img
                src="https://res.cloudinary.com/dah7l8utl/image/upload/v1751109758/Verification-Email_ma52da.png"
                alt="Verification Email Preview"
                className="img-fluid rounded border border-secondary"
                style={{ maxHeight: "600px", objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
