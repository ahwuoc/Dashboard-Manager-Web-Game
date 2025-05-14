import HTTP from "../common/http";

export interface Giftcode {
  id: number;
  code: string;
  count_left: number;
  detail: detail[];
  datecreate: string;
  expired: string;
  type: number;
}
export interface detail {
  temp_id: number;
  quantity: string;
  count: number;
  options: options[];
}
export interface options {
  param: number;
  id: number;
}
export const apiGiftcode = {
  getList: async () => HTTP.get<Giftcode[]>("/giftcode"),
  getDetail: async (id: string) => {
    const response = await HTTP.get(`/giftcode/${id}`);
    return response;
  },
  create: async (body: any) => {
    const response = await HTTP.post("/giftcode/create", { body });
    return response;
  },
  delete: async (id: number) => {
    const response = await HTTP.delete(`/giftcode/${id}`);
    return response;
  },
  update: async (id: number, data: any) => {
    const response = await HTTP.post(`/giftcode/update/${id}`, data);
    return response;
  },
};
