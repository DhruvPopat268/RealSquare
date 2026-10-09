import axios from "axios";

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url ?? "";
    const isLoginRequest = /\/api\/system-users\/(send-otp|verify-otp)\/?(?:\?|$)/.test(requestUrl);
    const isCurrentUserRequest = /\/api\/system-users\/me\/?(?:\?|$)/.test(requestUrl);

    if (
      error.response?.status === 401 &&
      !isLoginRequest &&
      !isCurrentUserRequest &&
      window.location.pathname !== "/login"
    ) {
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axios;
