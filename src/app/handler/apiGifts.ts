import http from "../common/http";

export const apiGifts = {
  post: (body: unknown) => http.post("/api/gifts", body),
};
