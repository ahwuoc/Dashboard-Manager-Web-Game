import HTTP from "../common/http";
import type { item_option_template } from "@/generated/prisma";

type ResponseApi<T> = {
  data: T;
  message?: string;
};

export const apiOptions = {
  getAll: async () =>
    HTTP.get<ResponseApi<item_option_template[]>>("/api/options"),
  search: async (searchTerm: string) => {
    if (!searchTerm) throw new Error("Search term is required");
    return HTTP.get<ResponseApi<item_option_template[]>>(
      `/api/options/search?search=${encodeURIComponent(searchTerm)}`,
    );
  },
};
