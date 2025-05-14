import HTTP from "../common/http";

export interface ItemOption {
  id: number;
  NAME: number;
  type: number;
}

export const apiOptions = {
  getList: async () => HTTP.get<ItemOption[]>("/options"),
  search: async (searchTerm: string) => {
    if (!searchTerm) throw new Error("Search term is required");
    const response = await HTTP.get<ItemOption[]>(
      `/options/search?search=${encodeURIComponent(searchTerm)}`
    );
    return response;
  },
};
