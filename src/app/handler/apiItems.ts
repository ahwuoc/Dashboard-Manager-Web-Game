import HTTP from "../common/http";
import type { item_template, type_item } from "@/generated/prisma";

type ResponseApi<T> = {
  data: T;
};

export const apiItems = {
  // Lấy tất cả item
  update: (id: number, data: unknown) =>
    HTTP.put<ResponseApi<item_template>>(`/api/items/${id}`, data),
  getAll: () => HTTP.get<ResponseApi<item_template[]>>("/api/items"),
  getItemType: () => HTTP.get<ResponseApi<item_template[]>>("/api/type_items"),
  getDetail: (id: string) =>
    HTTP.get<ResponseApi<type_item[]>>(`/api/type_items/${id}`),
  search: (searchTerm: string) => {
    if (!searchTerm.trim()) throw new Error("Search term is required");
    return HTTP.get<ResponseApi<item_template[]>>(
      `/api/items/search?search=${encodeURIComponent(searchTerm)}`,
    );
  },
};
