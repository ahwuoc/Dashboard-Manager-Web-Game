import http from "../common/http";

type ResponseApi<T> = {
  data: T;
};
export const apiTabs = {
  getAll: () => http.get<ResponseApi<any>>("/api/tabs"),
};
