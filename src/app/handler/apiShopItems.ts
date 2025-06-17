import http from "../common/http";
import { item_shop } from "@/generated/prisma";
import type { ItemShopOptionWithTemplate } from "../admin/manage-shop/options/[id]/page";
type ResponseApi<T> = {
  data: T;
  message: string;
};
export const apiShopItems = {
  getAll: async () =>
    await http.get<ResponseApi<item_shop[]>>("/api/shop-items"),
  update: async (id: number, body: unknown) =>
    await http.put<unknown>(`/api/shop-items/${id}`, body),
  delete: async (id: number) =>
    await http.delete<unknown>(`/api/shop-items/${id}`),
  getById: async (id: number) =>
    await http.get<ResponseApi<ItemShopOptionWithTemplate[]>>(
      `/api/shop-items/${id}`,
    ),
  getOptionsById: async (id: number) =>
    await http.get<ResponseApi<ItemShopOptionWithTemplate[]>>(
      `/api/shop-items/options/${id}`,
    ),
  deleteOption: async (body: unknown) =>
    await http.delete<unknown>(`/api/shop-items/options`, body),
  updateOption: async (body: unknown) =>
    await http.put<unknown>(`/api/shop-items/options`, body),
  createOption: async (body: unknown) =>
    await http.post<unknown>(`/api/shop-items/options`, body),
};
