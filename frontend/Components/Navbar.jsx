import { useRouter } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import BootstrapLoader from "./BootstrapLoader";
import { authStore } from "../src/store/authStore";
import { Tooltip } from "bootstrap";

const Navbar = () => {
  const router = useRouter();

  const isLoggedInZustand = authStore((state) => state.isLoggedIn);
  const userAvatorURl = authStore((state) => state.userAvatorURl);

  // Use Effect To Allow Profile Hover Functionality.....
  useEffect(() => {
    const getTheProjects = async () => {
      const tooltipTriggerList = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]',
      );
      tooltipTriggerList.forEach((el) => new Tooltip(el));
    };

    getTheProjects();
  }, [router, isLoggedInZustand]);

  const handleCreate = () => {
    router.navigate({ to: "/home/create" });
  };

  const handleLogout = () => {
    router.navigate({ to: "/logout" });
  };

  function showProfile() {
    router.navigate({ to: "/showProfile" });
  }

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
          <div className="d-none d-sm-flex align-items-center ms-auto">
            <button onClick={handleCreate} className="btn btn-warning me-2">
              Create Project
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-outline-danger me-3"
            >
              Logout
            </button>

            {/* 👤 Avatar Always Visible */}
            {userAvatorURl && (
              <img
                src={userAvatorURl}
                alt="User Avatar"
                className="rounded-circle shadow"
                onClick={showProfile}
                style={{
                  width: "40px",
                  height: "40px",
                  objectFit: "cover",
                  cursor: "pointer",
                  transition: "0.3s ease",
                  border: "2px solid #ffc107",
                }}
                title="View Profile"
              />
            )}
          </div>

          {/* Mobile Menu (buttons only) */}
          <div className="d-sm-none d-flex align-items-center gap-2 ms-auto">
            <div className="dropdown">
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

            {/* Avatar in mobile mode (outside dropdown) */}
            {userAvatorURl && (
              <img
                src={userAvatorURl}
                alt="User Avatar"
                className="rounded-circle shadow"
                onClick={showProfile}
                style={{
                  width: "40px",
                  height: "40px",
                  objectFit: "cover",
                  cursor: "pointer",
                  border: "2px solid #ffc107",
                }}
                title="View Profile"
              />
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
