# 🚨 Fixing the `404: NOT_FOUND` Error on Page Reload in Vercel Deployments (SPA)

## 📌 Problem Overview

When deploying a **Single Page Application (SPA)** — such as a Vite + React app — on **Vercel**, you might encounter this error when refreshing a page like `/dashboard`, `/profile`, or any non-root route:

```
404: NOT_FOUND
Code: NOT_FOUND
ID: bom1::xyz123456...
```

This issue **only occurs on page reload or direct navigation to nested routes**, while navigation using links or `useNavigate()` works perfectly.

---

## 🧠 Why This Happens

Vercel is a static hosting provider that expects a physical file for every route.

### What Vercel Does on Page Reload:

- You visit `/dashboard`
- Vercel **looks for a file** called `/dashboard.html` or `/dashboard/index.html` in the deployed static output (e.g. `dist/`)
- It **cannot find it**, because:

  - SPAs **serve all pages through `index.html`**
  - Routing is handled entirely in the **browser** using **React Router** (or similar client-side router)

- Vercel returns a `404`

---

## ✅ Solution: Use a `vercel.json` File for Rewrites

We need to instruct Vercel to:

> Always serve `index.html` for any route, and let the browser-side router handle it.

### 📁 Step-by-Step Fix

#### 1. Create a `vercel.json` File in Your Frontend Project Root

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This rule matches **all incoming routes** and rewrites them to serve `/index.html`.

#### 2. Project Structure

Make sure your `vercel.json` file is at the root level of your frontend project:

```
tasknexus-frontend/
├── public/
│   └── index.html
├── src/
├── dist/ (or build/)
├── vercel.json ✅
```

#### 3. Commit and Push the Change

```bash
git add vercel.json
git commit -m "fix: SPA route handling for Vercel using vercel.json"
git push
```

#### 4. Redeploy to Vercel

Vercel will automatically pick up the `vercel.json` and apply the rewrite rules.

---

## 🧪 Example: Navigating to `/dashboard`

| Action                                                 | Without `vercel.json` | With `vercel.json`                    |
| ------------------------------------------------------ | --------------------- | ------------------------------------- |
| Go to `/dashboard` using `<Link />` or `useNavigate()` | ✅ Works              | ✅ Works                              |
| Refresh `/dashboard` page                              | ❌ 404 NOT_FOUND      | ✅ Works (rewritten to `/index.html`) |
| Open `/dashboard` in a new tab                         | ❌ 404 NOT_FOUND      | ✅ Works                              |

---

## ✅ Bonus: Build Configuration for Vite

Ensure you're using correct build settings in **Vercel dashboard**:

- **Framework Preset**: `Vite`
- **Build Command**: `vite build`
- **Output Directory**: `dist`
- **Install Command**: `npm install` or `yarn install`

---

## 🧩 Applicable Frameworks

This issue and solution apply to:

- ✅ Vite + React
- ✅ CRA (Create React App)
- ✅ Vue (Vue Router in history mode)
- ✅ Angular (with path-based routing)

---

## 🛠 Advanced Option (Optional): Redirect Instead of Rewrite

If you want to handle it as a redirect (not recommended for SPAs), you could use:

```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "destination": "/index.html",
      "statusCode": 200
    }
  ]
}
```

But **rewrites** are preferred for seamless SPA UX.

---

## 📌 Summary

| 🔍 Issue  | SPA on Vercel returns 404 on page reload or deep linking                    |
| --------- | --------------------------------------------------------------------------- |
| 🎯 Cause  | Vercel expects physical file for each route                                 |
| 🛠 Fix     | Add `vercel.json` with a rewrite rule to serve `/index.html` for all routes |
| ✅ Result | Page reloads, direct links, and SPA routing all work without 404s           |

---

## 📎 Reusable Snippet

Add this to all your Vercel-hosted SPA projects:

```json
// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
