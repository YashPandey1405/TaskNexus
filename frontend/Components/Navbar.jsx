import { useRouter } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import BootstrapLoader from "./BootstrapLoader";

const Navbar = () => {
  const router = useRouter();

  const handleCreate = () => {
    router.navigate({ to: "/home/create" });
  };

  const handleLogout = () => {
    router.navigate({ to: "/logout" });
  };

  return (
    <>
      <BootstrapLoader />
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom mb-4 px-4 py-3">
        <div className="container-fluid">
          {/* Brand */}
          <Link
            to="/home"
            className="navbar-brand d-flex align-items-center text-white"
          >
            <i className="fas fa-diagram-project fa-xl text-warning"></i>
            <span className="ms-2 fw-semibold">TaskNexus</span>
          </Link>

          {/* Desktop Buttons */}
          <div className="d-none d-sm-flex ms-auto">
            <button onClick={handleCreate} className="btn btn-warning me-2">
              Create Project
            </button>
            <button onClick={handleLogout} className="btn btn-outline-danger">
              Logout
            </button>
          </div>

          {/* Mobile Dropdown */}
          <div className="dropdown d-sm-none ms-auto">
            <button
              className="btn btn-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Menu
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button className="dropdown-item" onClick={handleCreate}>
                  Create Project
                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
