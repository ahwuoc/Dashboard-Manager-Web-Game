import { BoxItemAction } from "../admin/manager-open-items/page";
import http from "../common/http";

export type ApiResponse<T> = {
  data: T;
  message: string;
};

export const apiOpenItems = {
  updateBoxAction: (id: number, body: unknown) =>
    http.put<ApiResponse<unknown>>(`/api/open-items?id=${id}`, body),
  getAllBoxActions: () =>
    http.get<ApiResponse<BoxItemAction[]>>("/api/open-items"),
  createBoxAction: (body: unknown) =>
    http.post<ApiResponse<unknown>>("/api/open-items", body),
};
