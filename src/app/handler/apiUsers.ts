import HTTP from "../common/http";
import type { account } from "@/generated/prisma";

type ApiResponse<T> = {
  data: T;
  message?: string;
};
export const apiUser = {
  getAll: () => HTTP.get<ApiResponse<account[]>>("/api/users"),

  getById: (id: number) => HTTP.get<ApiResponse<account>>(`/api/users/${id}`),

  delete: (id: number) => HTTP.delete<ApiResponse<account>>(`/api/users/${id}`),
  addCoin: (id: number, coinAmount: number) =>
    HTTP.post<ApiResponse<account>>(`/api/users/${id}`, coinAmount),
};
