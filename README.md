# TaskNexus 🧠📌

![Backend](https://img.shields.io/badge/backend-complete-success)
![Frontend](https://img.shields.io/badge/frontend-complete-success)
![Routing](https://img.shields.io/badge/routing-TanStack_Router-blue)
![State](https://img.shields.io/badge/state-Zustand-purple)
![Deployment](https://img.shields.io/badge/deployment-Vercel_&_Render-green)

**TaskNexus** is a full-featured **Kanban Task Management System** designed for modern team collaboration. Built using a production-ready **MERN Stack**, it offers scalable architecture, role-based access, and clean drag-and-drop workflows. Whether you're a developer, project manager, or team lead — this system streamlines task organization and productivity like a pro.

---

## 🚀 Project Status

- ✅ **Backend API development is completed**
- ✅ **Frontend React UI is complete and deployed**
- ✅ **Deployed on Vercel (Frontend) & Render (Backend)**
- 🔄 **Version 2 in progress — WebSocket + Redis + Kafka integration**
- 🧠 **Version 3 (planned) — AI features + GraphQL API layer**

---

## 📖 Project Journey

This project is a culmination of structured, layered development through milestone-based mini-projects:

| Project                                                              | Date     | Description                                                                             |
| -------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------- |
| [TaskFlow Kanban](https://github.com/YashPandey1405/TaskFlow-Kanban) | Mar 2025 | JavaScript fundamentals, drag-and-drop, and local storage.                              |
| [Loginify-JWT](https://github.com/YashPandey1405/Loginify-JWT)       | Apr 2025 | Secure backend with JWT, MongoDB, route/controller structure.                           |
| [Loginify-MERN](https://github.com/YashPandey1405/Loginify-MERN)     | Apr 2025 | Connected frontend/backend, managed CORS, cookies, token flow.                          |
| TaskNexus Backend                                                    | May 2025 | Modular backend with validation, mailing, file uploads, and role-based access.          |
| [NxtLink](https://github.com/YashPandey1405/NxtLink)                 | Jun 2025 | Deployment-focused shortener app using Next.js and cloud infrastructure.                |
| TaskNexus Frontend                                                   | Jun 2025 | Zustand + TanStack Router based frontend with real-time-ready UI and responsive design. |

---

## 🔧 Tech Stack Breakdown

### 📌 Core Stack – MERN

- **MongoDB Atlas**: Cloud-hosted NoSQL database with six relational models using ObjectId-based mappings.
- **Express.js**: Backend logic with middleware layers, validation, and mail/file handling.
- **React.js**: UI components built for a seamless Kanban experience.
- **Node.js**: Backend server logic with modular folder structure and clean error handling.

### ⚙️ Frontend Ecosystem

- **TanStack Router**: Lightweight, advanced routing system for nested layouts and route guards.
- **Zustand**: Minimalist and fast global state management without boilerplate.
- **DnD Kit**: Drag-and-drop library used to reorder tasks and columns.
- **Bootstrap 5**: Responsive UI with a clean, mobile-friendly layout.
- **Axios**: For structured HTTP requests with token interceptors.

### ☁️ Backend Features

- **Zod**: End-to-end input validation for schema-safe request handling.
- **Mailgen + Mailtrap + NodeMailer**: Email sending setup for task invites and notifications.
- **Multer + Cloudinary**: File uploads (attachments, images) and secure cloud storage.
- **JWT Auth**: Secure login with middleware for protected routes and session management.
- **Role-Based Access**: `project_admin`, `admin`, `member` — enforced via middleware and model-level filters.
- **Deployment**:

  - **Frontend**: Hosted on **Vercel**
  - **Backend**: Deployed via **Render**

---

## ✨ Features

### ✅ Implemented (v1.0)

- 🧠 Complete task CRUD operations
- 📌 Drag-and-drop Kanban with reorder persistence
- 🔐 Secure JWT-based authentication
- 🧾 Project-wise task segregation
- 🧑‍🤝‍🧑 Role-based access control with 3 roles
- 📎 File Upload & Cloud Storage
- 📬 Mailing via transactional services
- 📅 Subtasks, priority tags, deadlines, and activity metadata

### 🛠️ In Progress (v2.0)

- 🔁 Real-time sync using **WebSockets + Socket.io**
- ⚙️ **Redis** integration for horizontal scaling
- 🧪 **Kafka** for future analytics and activity tracking
- 🖥️ Moving backend to **bare-metal Linode servers**
- 🧩 **PM2** process manager + **Caddy** reverse proxy setup

### 🚀 Planned (v3.0)

- 🤖 AI-enhanced features: suggestions, task prioritization, smart alerts
- 🌐 Partial GraphQL API exposure for flexible queries
- ✅ Final polish of UX & wrap-up of core development phase

> Development is a continuous process — and I plan to evolve TaskNexus into a benchmark open-source project.

---

## 💡 The Bigger Picture

TaskNexus lays the foundation for my dream project:
👉 **[CodeVantage](https://github.com/YashPandey1405/CodeVantage)** — a **LeetCode-inspired coding platform** built using **Prisma** + **PostgreSQL**, designed to offer real-time problem-solving, smart evaluation, and rich analytics.

What I’ve built and learned in TaskNexus will directly support collaborative problem boards, task syncing, role management, and real-time challenge updates in CodeVantage.

---

## 🧪 Local Setup

### Backend

```bash
git clone https://github.com/YashPandey1405/TaskNexus.git
cd TaskNexus/backend
npm install
npm start
```

### Frontend

```bash
cd TaskNexus/frontend
npm install
npm run dev
```

> ⚠️ Make sure to provide your `.env` variables for MongoDB, Cloudinary, Mailtrap, etc.

---

## 🌐 Deployment Summary

- **Frontend**: Hosted on **Vercel**
- **Backend**: Hosted on **Render**
- **Planned Migration (v2)**:

  - Move backend to **Linode (bare metal)**
  - Setup **PM2** and **Caddy** for reverse proxy and service reliability
  - Introduce **Redis + Kafka** for scalability and message queuing

---

## 🤝 Contributing

Contribution guidelines will be published post v2.0.
Feel free to fork the repo, suggest improvements, or raise issues!

---

## 👨‍💻 Author

Crafted with dedication by **Yash Pandey** — MERN Stack Developer, Backend Architect, and ML Enthusiast.
Exploring scalable, collaborative web systems with a passion for performance, real-time UX, and clean DevOps workflows.
