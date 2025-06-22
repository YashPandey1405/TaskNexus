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
      // if (options.body instanceof FormData) {
      //   delete headers["Content-Type"]; // Let the browser handle Content-Type for FormData
      //   // headers["Content-Type"] = "multipart/form-data"; // To Send 'multipart/form-data' To The Server......
      // } else if (options.body) {
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

  //Auth endpoints

  async signup(email, username, fullname, password) {
    return this.customFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email,
        username,
        fullname,
        password,
      }),
    });
  }

  async login(email, username, password) {
    return this.customFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, username, password }),
    });
  }

  async getLoginPage() {
    return this.customFetch("/login");
  }

  async getSignupPage() {
    return this.customFetch("/signup");
  }

  async getProfiles() {
    return this.customFetch("/me");
  }

  async logout() {
    return this.customFetch("/logout");
  }

  async isloggedIn() {
    return this.customFetch("/status");
  }
}

const apiClient = new ApiClient();

export default apiClient; // Single instance of ApiClient.....
