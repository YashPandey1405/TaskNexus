import { useRouter } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import BootstrapLoader from "./BootstrapLoader";
import { authStore } from "../src/store/authStore";

const Navbar_AboutPage = () => {
  const router = useRouter();

  const isLoggedInZustand = authStore((state) => state.isLoggedIn);

  const handleLoginRedirect = () => {
    router.navigate({ to: "/login" });
  };

  const handleHomePageRedirect = () => {
    router.navigate({ to: "/home" });
  };

  return (
    <>
      <BootstrapLoader />
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom mb-4 px-4 py-3">
        <div className="container-fluid">
          {/* Brand */}
          <Link
            to="/about"
            className="navbar-brand d-flex align-items-center text-white"
          >
            <i className="fas fa-diagram-project fa-xl text-warning"></i>
            <span className="ms-2 fw-semibold">TaskNexus</span>
          </Link>

          {/* Buttons For redirect Of The User*/}
          <div className="ms-auto">
            {!isLoggedInZustand && (
              <button
                onClick={handleLoginRedirect}
                className="btn btn-primary me-2"
              >
                Login
              </button>
            )}
            {isLoggedInZustand && (
              <button
                onClick={handleHomePageRedirect}
                className="btn btn-outline-primary me-3"
              >
                View Projects
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar_AboutPage;
