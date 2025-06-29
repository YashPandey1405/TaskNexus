import { createFileRoute } from "@tanstack/react-router";
import Navbar_AboutPage from "../../Components/Navbar_AboutPage";

export const Route = createFileRoute("/about")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="bg-black text-light min-vh-100 font-monospace">
      <Navbar_AboutPage />
      {/* ===== Hero Section ===== */}
      <section className="container py-5 border-bottom border-secondary">
        <div className="card bg-dark text-white border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="row g-0 flex-column flex-md-row align-items-center">
            <div className="col-md-4 text-center p-4">
              <img
                src="https://res.cloudinary.com/dah7l8utl/image/upload/v1750844086/TaskNexus_MERN-Project/oo5qxmxyw0c4aspjakzs.jpg"
                className="img-fluid rounded-circle shadow-sm"
                alt="Yash Pandey"
                style={{ width: "180px", height: "180px", objectFit: "cover" }}
              />
            </div>
            <div className="col-md-8 p-4 text-md-start text-center">
              <h1 className="fw-bold display-5 mb-2">Yash Pandey</h1>
              <p className="lead text-white">
                MERN Stack Dev | AI Explorer | 700+ LeetCode (Java) | Web
                Architect
              </p>
              <div className="d-flex justify-content-md-start justify-content-center flex-wrap gap-3 mt-3">
                <a
                  href="https://linkedin.com/in/yashpandey29/"
                  className="btn btn-outline-light btn-sm px-3"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-brands fa-linkedin fa-lg me-2"></i>LinkedIn
                </a>
                <a
                  href="https://github.com/YashPandey1405"
                  className="btn btn-outline-light btn-sm px-3"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-brands fa-github fa-lg me-2"></i>GitHub
                </a>
                <a
                  href="https://leetcode.com/u/pandeyyash041/"
                  className="btn btn-outline-light btn-sm px-3"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-solid fa-code fa-lg me-2"></i>LeetCode
                </a>
                <a
                  href="https://drive.google.com/drive/folders/1g9SM-mmxfu1C5_BDI5AUbNjQiQOWuVCT?usp=sharing"
                  className="btn btn-primary btn-sm px-3"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-solid fa-file-lines fa-lg me-2"></i>View
                  Resume
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== About Me ===== */}
      <section className="container py-5 border-bottom border-secondary">
        <h2 className="text-center mb-4">👨‍💻 About Me</h2>
        <div className="row g-4">
          <div className="col-md-6">
            <p>
              I’m a 4th-year CSE student at MAIT (2022–26), passionate about
              building production-ready web systems. From React and Node.js to
              advanced backend tooling like Redis, Docker, and WebSockets, my
              journey has been practical and iterative. I’ve also solved 700+
              LeetCode problems in Java and love working on real-time scalable
              projects.
            </p>
            <ul className="list-unstyled">
              <li>
                💡 <strong>Problem Solver</strong> with DSA roots (Java)
              </li>
              <li>
                ⚙️ Continuously Strengthening{" "}
                <strong>MERN Stack Concepts</strong>
              </li>
              <li>
                🧠 Exploring <strong>Gen AI</strong>, Deep Learning, NLP
              </li>
              <li>
                🚀 Enthusiastic About <strong>DevOps</strong> & Modern
                Deployment Workflows
              </li>
            </ul>
          </div>
          <div className="col-md-6">
            <div className="bg-dark rounded shadow-sm p-3">
              <h5 className="text-info">🔧 Skills Snapshot</h5>
              <ul className="mb-2">
                <li>Languages: Java, JS, TS, Python, SQL</li>
                <li>Frontend: React, Next.js, Zustand, Bootstrap</li>
                <li>Backend: Node.js, Express, MongoDB, Prisma, Redis</li>
                <li>DevOps: Docker, AWS EC2/S3, GitHub Actions</li>
                <li>Data Science: Pandas, scikit-learn, TensorFlow</li>
              </ul>
              <span className="badge bg-info me-2">JWT Auth</span>
              <span className="badge bg-secondary me-2">WebSockets</span>
              <span className="badge bg-success me-2">CI/CD</span>
              <span className="badge bg-warning text-dark">Gen AI</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Project Section ===== */}
      <section className="container py-5 border-bottom border-secondary">
        <h2 className="text-center mb-4">🚀 Project: TaskNexus</h2>
        <div className="row g-4">
          <div className="col-md-6">
            <p>
              <strong>TaskNexus</strong> is a full-featured MERN-based Kanban
              Task Management System with robust backend architecture, JWT auth,
              role-based control, and a modular frontend built with Zustand and
              TanStack Router.
            </p>
            <p>
              It's designed with future scalability in mind — includes AWS
              deployment, real-time sync (WebSocket), and planned multi-server
              support with Redis and Kafka.
            </p>
            <a
              href="https://github.com/YashPandey1405/TaskNexus"
              className="btn btn-outline-info btn-sm"
              target="_blank"
            >
              <i className="fab fa-github me-1"></i> View GitHub Repo
            </a>
          </div>
          <div className="col-md-6">
            <ul className="list-group list-group-flush bg-dark rounded shadow-sm">
              <li className="list-group-item bg-dark text-light">
                ✅ Drag-and-Drop Kanban (DnD Kit)
              </li>
              <li className="list-group-item bg-dark text-light">
                ✅ JWT + Role-Based Authorization
              </li>
              <li className="list-group-item bg-dark text-light">
                ✅ Subtask Management, Priorities
              </li>
              <li className="list-group-item bg-dark text-light">
                ✅ Zustand State Management
              </li>
              <li className="list-group-item bg-dark text-light">
                ✅ AWS EC2 + S3 for Full Deployment
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ===== Journey Section ===== */}
      <section className="container pt-5">
        <h2 className="text-center mb-5 display-6 fw-bold">
          {" "}
          My Journey to Building TaskNexus
        </h2>
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="timeline position-relative ps-4 ms-3 border-start border-3 border-info">
              {[
                {
                  title: "TaskFlow Kanban",
                  date: "Mar 2025",
                  desc: "Understood core JavaScript principles including drag-and-drop and local storage persistence.",
                  link: "https://github.com/YashPandey1405/TaskFlow-Kanban",
                },
                {
                  title: "Loginify-JWT",
                  date: "Apr 2025",
                  desc: "Learned backend fundamentals: route/controller separation, JWT auth, and MongoDB Atlas integration.",
                  link: "https://github.com/YashPandey1405/Loginify-JWT",
                },
                {
                  title: "Loginify-MERN",
                  date: "Apr 2025",
                  desc: "Connected React frontend with backend using APIs, tackled CORS issues and frontend token handling.",
                  link: "https://github.com/YashPandey1405/Loginify-MERN",
                },
                {
                  title: "TaskNexus Backend",
                  date: "May 2025",
                  desc: "Designed a robust modular backend with authentication middleware and role-based routes.",
                },
                {
                  title: "NxtLink (Next.js URL Shortener)",
                  date: "Jun 2025",
                  desc: "Practiced production-level deployment logic, frontend-backend linking and env setup.",
                  link: "https://github.com/YashPandey1405/NxtLink",
                },
                {
                  title: "TaskNexus Frontend",
                  date: "Jun 2025",
                  desc: "Built the frontend using Zustand & TanStack Router with drag-and-drop task UI in Bootstrap.",
                },
              ].map((step, i) => (
                <div key={i} className="mb-5 position-relative">
                  <div
                    className="position-absolute top-0 start-0 translate-middle-y bg-info rounded-circle"
                    style={{ width: "1rem", height: "1rem" }}
                  ></div>
                  <div className="ms-4 ps-2">
                    <h5 className="fw-bold mb-1 text-info">
                      {step.date} — {step.title}
                    </h5>
                    <p className="text-light mb-1">{step.desc}</p>
                    {step.link && (
                      <a
                        href={step.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-warning text-decoration-none"
                      >
                        <i className="fa-brands fa-github me-1"></i> View on
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-dark text-light py-4 border-top border-secondary shadow-sm mt-5">
        <div className="container text-center">
          <p className="mb-3 fw-semibold fs-6">
            Built with 💻 by Yash Pandey &copy; 2025
          </p>
          <div className="d-flex justify-content-center gap-4">
            <a
              href="https://www.linkedin.com/in/yashpandey29/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-light fs-4"
            >
              <i className="fa-brands fa-linkedin"></i>
            </a>
            <a
              href="https://github.com/YashPandey1405"
              target="_blank"
              rel="noopener noreferrer"
              className="text-light fs-4"
            >
              <i className="fa-brands fa-github"></i>
            </a>
            <a
              href="https://leetcode.com/u/pandeyyash041/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-light fs-4"
            >
              <i className="fa-solid fa-code"></i>
            </a>
            <a
              href="https://www.instagram.com/yashpandey029/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-light fs-4"
            >
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a
              href="https://twitter.com/pandeyyash041"
              target="_blank"
              rel="noopener noreferrer"
              className="text-light fs-4"
            >
              <i className="fa-brands fa-x-twitter"></i>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
