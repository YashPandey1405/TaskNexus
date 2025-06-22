## 🔍 HealthCheck Route - TaskNexus Project

This route is designed to verify whether the server is running properly.

---

### 📍 Endpoint

**GET** `http://localhost:8080/api/v1/healthcheck`

---

### ✅ Successful Response

```json
{
  "statusCode": 200,
  "data": {
    "message": "Server is running"
  },
  "message": "Success",
  "success": true
}
```

---

### 📌 Purpose

The `healthcheck` route is a simple endpoint to ensure the server is up and running. It can be used during development, deployment, or uptime monitoring to confirm that the backend is responsive.
