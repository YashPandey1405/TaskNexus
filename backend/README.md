# TaskNexus – Backend API 🧠

The **TaskNexus Backend** is a modular, scalable, and secure REST API built using the **Node.js + Express.js + MongoDB** stack. It supports authentication, task/project management, and role-based access control, forming the core logic behind the TaskNexus Kanban Task Management System.

---

## 🔧 Technologies Used

### 🟢 Node.js
A fast, event-driven runtime used to build scalable backend services. Enables asynchronous, non-blocking operations and high-performance I/O handling.

### ⚙️ Express.js
Minimal and flexible Node.js web framework for creating robust RESTful APIs. Supports middleware architecture and route organization.

### 🍃 MongoDB + Mongoose
MongoDB is a document-based NoSQL database used for flexible and scalable data storage. Mongoose adds schema validation, model relationships, and query helpers for structured interaction.

### 🔐 JWT (JSON Web Tokens)
Used for secure stateless authentication. Ensures only authorized users can access protected resources, with support for role-based access.

### 🔑 bcrypt.js
Library for hashing passwords before storage. Ensures secure credential management and protection against common attacks.

### 🛡️ Helmet & CORS
Security-related middlewares:
- **Helmet**: Sets HTTP headers to prevent well-known web vulnerabilities.
- **CORS**: Allows secure communication between frontend and backend across domains.

### 🧪 dotenv
Loads environment variables from `.env` file, ensuring secrets and configuration stay outside the source code.

---

## ✨ Core Features

- ✅ **User Authentication & Authorization**
  - Signup / Login
  - JWT-based session management
  - Role-based access (admin/user)

- ✅ **Task & Project Management APIs**
  - Full CRUD operations
  - Metadata support (priority, deadlines, subtasks)

- ✅ **Secure Architecture**
  - Protected routes with middleware
  - Encrypted credentials
  - Scalable controller-service pattern

---

## 📦 Setup Instructions

### 1. Clone and Navigate

```bash
git clone https://github.com/YashPandey1405/TaskNexus.git
cd TaskNexus/backend
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

Add a `.env` file with the following content:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

### 4. Start the Development Server

```bash
npm run dev
```

Server runs on `http://localhost:5000` by default.

---

## 📈 Future Enhancements

* 🔄 Real-time sync via **Socket.IO**
* 📊 Activity logs and audit trails
* 🧪 Unit + Integration Testing (Jest + Supertest)
* ☁️ Production deployment on **AWS EC2** with **Nginx** + **PM2**
* 🛡️ CI/CD automation using **GitHub Actions**

---

## 👨‍💻 Developed by

**Yash Pandey**
*MERN Stack Developer passionate about scalable backend systems, clean architecture, and real-time applications.*

> For frontend details and full stack documentation, refer to the [main README](../README.md).

