import HTTP from "../common/http";
import type { player } from "@/generated/prisma";
type ApiResponse<T> = {
  data: T;
  message?: string;
};
export const apiPlayers = {
  getAll: () => HTTP.get<ApiResponse<player[]>>("/api/players"),
  getById: (id: number) => HTTP.get<ApiResponse<player>>(`/api/users/${id}`),
  update(userId: number, data: Partial<player>) {
    return HTTP.put<ApiResponse<player>>(`/api/users/${userId}`, data);
  },
  delete: (id: number) => HTTP.delete<ApiResponse<player>>(`/api/users/${id}`),
  addCoin: (id: number, coinAmount: number) =>
    HTTP.post<ApiResponse<player>>(`/api/users/${id}`, coinAmount),
};
