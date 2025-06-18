import http from "../common/http";

export const apiAuth = {
  login: (data: unknown) => http.post("/api/auth/login", data),
};
