import { api } from "./api";

export function registerUser(userData) {
  return api("/api/users", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export function loginUser(credentials) {
  return api("/api/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function logoutUser(token) {
  return api("/api/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}