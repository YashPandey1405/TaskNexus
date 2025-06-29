# 🚀 TaskNexus Frontend Overview

> Modern task management interface powered by React.

![React](https://img.shields.io/badge/React-18.0-blue?logo=react&logoColor=white)
![TanStack Router](https://img.shields.io/badge/TanStack%20Router-Routing-informational?logo=reactrouter&logoColor=white&color=blueviolet)
![Zustand](https://img.shields.io/badge/Zustand-State--Management-ff69b4?logo=zotero&logoColor=white)
![Custom Hooks](https://img.shields.io/badge/Custom%20Hooks-React-blue?logo=react)
![apiClient](https://img.shields.io/badge/apiClient-Singleton-orange?logo=axios&logoColor=white)

---

## 🧩 Overview

This is the **frontend module** of the **TaskNexus** platform, built entirely in **pure React**. The UI is sleek, responsive, and optimized for performance and scalability. The project uses **modern React architecture**, emphasizing clean code and maintainability.

---

## 🔧 Tech Stack & Tools

- **React** for UI rendering and component architecture.
- **TanStack Router** for modern file-based routing and nested layouts.
- **Zustand** for minimal and scalable global state management.
- **Custom Hooks** for reusable logic and side-effect management.
- **Singleton `apiClient`** for centralized API handling using Axios.
- **Bootstrap + Custom SCSS** for UI styling and responsiveness.

---

## 📁 Project Highlights

- Robust routing with layout separation using TanStack Router.
- Global state like auth and user roles managed using Zustand store.
- Alerts, auth states, form handlers built via **custom React hooks**.
- All API communication flows through a **singleton Axios client** with pre-configured base URL and interceptors.
- Protected routes and conditional UI rendering based on roles like `project_admin` or `member`.

---

## 🚀 Getting Started

```bash
cd frontend
npm install
npm run dev
```

> Built with ❤️ for scalable collaboration and productivity on the TaskNexus platform.
