import HTTP from "../common/http";

export interface Item {
  id: number;
  TYPE: number;
  gender: number;
  NAME: string;
  description: string;
  level: number;
  price: number;
  icon_id: string;
  part: number;
  is_up_to_up: string;
  power_require: number;
  gold: number;
  gem: number;
  head: number;
  body: number;
  leg: number;
  is_up_to_up_over_99: string;
  can_trade: string;
  comment: string;
}

export const apiItems = {
  getList: async () => HTTP.get<Item[]>("/item"),
  getDetail: async (id: string) => {
    const response = await HTTP.get(`/items/${id}`);
    return response;
  },
  search: async (searchTerm: string) => {
    // Đảm bảo rằng searchTerm không trống
    if (!searchTerm) throw new Error("Search term is required");
    const response = await HTTP.get<Item[]>(
      `/item/search?search=${encodeURIComponent(searchTerm)}`
    );
    return response;
  },
};
