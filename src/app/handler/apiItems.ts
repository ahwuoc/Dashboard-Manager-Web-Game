import HTTP from "../common/http";
import type { item_template } from "@/generated/prisma";

type ResponseApi<T> = {
  data: T;
};

export const apiItems = {
  // Lấy tất cả item
  getAll: () => HTTP.get<ResponseApi<item_template[]>>("/api/items"),

  getDetail: (id: string) =>
    HTTP.get<ResponseApi<item_template>>(`/api/items/${id}`),

  search: (searchTerm: string) => {
    if (!searchTerm.trim()) throw new Error("Search term is required");
    return HTTP.get<ResponseApi<item_template[]>>(
      `/api/items/search?search=${encodeURIComponent(searchTerm)}`,
    );
  },
};
