# 📦 TanStack Router Integration (Vite + React)

This guide walks you through the **manual setup of TanStack Router** in a Vite-based React project, including **npm installation**, **Vite config setup**, **folder structure**, and how to use **file-based routing with dynamic parameters** like `pid`.

---

## 🧰 1. Install TanStack Router

Run the following command in your project root:

```bash
npm install @tanstack/react-router
```

> ✅ This installs TanStack Router v1 for React.

---

## ⚙️ 2. Configure Vite

Make sure you're using **React plugin** and that file system routing will work smoothly:

### vite.config.js

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

✅ No special configuration is required for TanStack Router in `vite.config.js`, unless you're using special aliases or need server-side support.

---

## 📁 3. Setup File-Based Routing

TanStack Router supports **file-based routing** out of the box if you're using their `createFileRoute()` and `createRootRoute()` utilities.

### 👉 Folder Structure

```bash
src/
├── routes/
│   ├── __root.tsx
│   └── home/
│       └── (tasks)/
│           └── project/
│               └── $pid.tsx
```

- `__root.tsx`: The root layout file (like `<App />`).
- `(tasks)`: Optional layout segment.
- `$pid.tsx`: Dynamic route that captures the `pid` from the URL.

> This structure corresponds to the URL path: `/home/(tasks)/project/:pid`

---

## 🧩 4. Create Route Files

### `__root.tsx` — Root Layout

```tsx
import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
    </>
  ),
});
```

---

### `$pid.tsx` — Dynamic Project Page

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/home/(tasks)/project/$pid")({
  component: ProjectPage,
});

function ProjectPage() {
  const { pid } = Route.useParams(); // ← Dynamic param from route
  return <div>Project ID: {pid}</div>;
}
```

> 🧠 The `Route.useParams()` hook gives access to dynamic values like `pid` extracted from the filename.

---

## 🚀 5. Initialize the Router in `main.jsx`

### `main.jsx`

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
```

> ⚠️ Note: The `routeTree.gen.ts` or `routeTree.gen.js` file is **auto-generated**. Make sure your tooling generates it (e.g., with a script or a plugin).

---

## 🧪 6. Accessing URL Parameters

In the route file (`$pid.tsx`), you access route parameters like this:

```tsx
const { pid } = Route.useParams();
```

If your route is defined as `$pid.tsx`, this hook will return:

```ts
{
  pid: "123"; // when visiting /home/(tasks)/project/123
}
```

✅ This is powerful and clean for dynamic project pages, profiles, etc.

---

## 🛠 Optional: Auto-generate routeTree (Advanced Setup)

If you're working in TypeScript and want full type safety, you can use the official `tanstack-router-cli` to auto-generate route trees from files:

```bash
npx @tanstack/router-cli init
```

> This sets up route scanning + generation of `routeTree.gen.ts`.

---

## ✅ Summary

- 📦 Installed: `@tanstack/react-router`
- 🔧 Config: No special config needed for Vite
- 🗂 Routing: File-based route folders with dynamic segments (e.g., `$pid.tsx`)
- 🧠 Params: Extracted using `Route.useParams()`
- 🧪 Fully typed and testable routing experience
