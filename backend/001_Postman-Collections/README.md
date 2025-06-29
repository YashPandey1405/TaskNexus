# 🧩 TaskNexus API Collection - Postman

Welcome to the **Postman Collection** for the **TaskNexus** project — a robust and scalable Task Management Platform built with the **MERN** stack.

This collection is designed to help developers understand and test the full range of backend functionality implemented in TaskNexus.

---

## 🔧 Tech Stack

- **MongoDB** (Database)
- **Express.js** (Backend Framework)
- **Node.js** (Runtime Environment)
- **JWT** Authentication & Role-Based Access
- **Mongoose ODM**

---

## 📦 Key Features Covered in This Collection

The API is organized into 6 core modules:

### 1. 👤 User

- Signup, Login, Logout
- Role assignment
- Profile info

### 2. 📁 Project

- Create / Update / Delete Projects
- Fetch project details

### 3. 👥 ProjectMember

- Add / Remove Members
- Assign roles per project

### 4. ✅ Task

- Create / Update / Delete Tasks per project
- Task status, priority, and deadlines

### 5. 📌 SubTask

- Create Subtasks under a Task
- Manage subtasks independently

### 6. 🗒️ Project Notes

- Create / Edit / Delete Notes linked to Projects
- Author details and timestamps included

---

## 🔐 Authentication & Authorization

- Uses **JWT** to protect routes
- Middleware for **role-based permissions**
- Only **Admin / Project Admin / Member** can access specific endpoints

---

## 🧪 How to Use

1. Import the collection into Postman
2. Set the `{{baseURL}}` in your Postman environment (e.g., `http://localhost:5000/api/v1`)
3. Use the **Auth -> Login** endpoint to generate a token
4. Add the `Authorization: Bearer <token>` header to protected routes
5. Explore and test all modules with real-time responses

---

## 📝 Notes

- All responses follow a **standard response format** with:

  - `statusCode`
  - `data`
  - `message`

- Errors are handled via a custom `ApiError` class with helpful debug messages

---

## 📁 Project Status

✅ **Backend Complete & Fully Tested**  
🧪 **Tested Thoroughly via Postman**  
🚀 Ready for frontend integration followed By AWS Deployment

---

## 🤝 Author

Made with ❤️ by Yash Pandey  
Feel free to contribute or raise issues for feedback or enhancements!
