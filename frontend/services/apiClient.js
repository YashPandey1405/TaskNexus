class ApiClient {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  async customFetch(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = { ...this.defaultHeaders, ...options.headers };

      // // If the body is FormData, do not set Content-Type header manually
      if (options.body instanceof FormData) {
        delete headers["Content-Type"]; // Let the browser handle Content-Type for FormData
        // headers["Content-Type"] = "multipart/form-data"; // To Send 'multipart/form-data' To The Server......
      }
      // else if (options.body) {
      //   headers["Content-Type"] = "application/json"; // Default to application/json if not FormData
      // }

      const config = {
        ...options,
        headers,
        credentials: "include",
      };
      console.log(`Fetching ${url}`);
      const response = await fetch(url, config);
      //check if response.ok === value

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API Error", error);
      throw error;
    }
  }

  // Auth endpoints

  // This Is Just An Dummy Thing......
  async signup(formData) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          method: "POST",
          body: formData, // 👈 formData contains both text and file fields
          // ✅ Don't set headers — browser sets Content-Type correctly with boundary
        },
      );

      const result = await response.json(); // 👈 parse the response body

      console.log("Inside apiClient , The Response Is : ", result);
      return result;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  }

  async login(email, username, password) {
    return this.customFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, username, password }),
    });
  }

  async logout() {
    return this.customFetch("/auth/logout", {
      method: "POST",
    });
  }

  // Project endpoints

  async getProjects() {
    return this.customFetch("/project/getproject", {
      method: "GET",
    });
  }

  async getProjectByID(projectID) {
    return this.customFetch(`/project/getproject/${projectID}`, {
      method: "GET",
    });
  }

  async createProject(name, description) {
    return this.customFetch("/project", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    });
  }

  async editProject(name, description, projectID) {
    return this.customFetch(`/project/${projectID}`, {
      method: "PUT",
      body: JSON.stringify({ name, description }),
    });
  }

  async getAllTasksOfProject(projectID) {
    return this.customFetch(`/task/get-tasks/project/${projectID}`, {
      method: "GET",
    });
  }

  async deleteProject(projectID) {
    return this.customFetch(`/project/${projectID}`, {
      method: "DELETE",
    });
  }

  // Task endpoints
  async getAllProjectMembersDetails(projectID) {
    return this.customFetch(`/task/create-task/${projectID}`, {
      method: "GET",
    });
  }

  async getTaskByID(taskID) {
    return this.customFetch(`/task/get-tasks/${taskID}`, {
      method: "GET",
    });
  }

  async createTask(title, description, assignedTo, status, projectID) {
    return this.customFetch(`/task/create-task/${projectID}`, {
      method: "POST",
      body: JSON.stringify({ title, description, assignedTo, status }),
    });
  }

  async quickUpdateState(taskId, status) {
    return this.customFetch(`/task/quick-change/${taskId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  async updateTask(title, description, status, taskId) {
    return this.customFetch(`/task/${taskId}`, {
      method: "PUT",
      body: JSON.stringify({ title, description, status }),
    });
  }

  async deleteTask(taskId) {
    return this.customFetch(`/task/${taskId}`, {
      method: "DELETE",
    });
  }

  // Project-Member Routes.....
  async getProjectMembers(projectID) {
    return this.customFetch(`/project/project-member/${projectID}`, {
      method: "GET",
    });
  }

  async getProjectMembersList(projectID) {
    return this.customFetch(`/project/project-member/list/${projectID}`, {
      method: "GET",
    });
  }

  async getProjectMemberByID(projectMemberID) {
    return this.customFetch(
      `/project/project-member/member/${projectMemberID}`,
      {
        method: "GET",
      },
    );
  }

  async createProjectMember(userID, role, projectID) {
    return this.customFetch(`/project/project-member/${projectID}`, {
      method: "POST",
      body: JSON.stringify({ userID, role }),
    });
  }

  async UpdateProjectMember(role, projectMemberID) {
    return this.customFetch(
      `/project/project-member/change/${projectMemberID}`,
      {
        method: "PUT",
        body: JSON.stringify({ role }),
      },
    );
  }

  async deleteProjectMember(projectMemberID) {
    return this.customFetch(
      `/project/project-member/change/${projectMemberID}`,
      {
        method: "DELETE",
      },
    );
  }
}

const apiClient = new ApiClient();

export default apiClient; // Single instance of ApiClient.....
