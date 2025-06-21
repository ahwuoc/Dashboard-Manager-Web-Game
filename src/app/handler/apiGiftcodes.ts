import { giftcode_item_options, giftcode } from "@/generated/prisma";
import HTTP from "../common/http";

type ApiRespose<T> = {
  data: T;
  message: string;
};

export const apiGiftcode = {
  getAll: async () => await HTTP.get<ApiRespose<any[]>>("/api/giftcodes"),

  getDetail: async (id: string) =>
    await HTTP.get<ApiRespose<any>>(`/giftcode/${id}`),

  deleteOption: async (optionId: number) =>
    await HTTP.delete<ApiRespose<null>>(
      `/api/giftcodes/options?id=${optionId}`,
    ),

  deleteItem: async (itemId: string) =>
    await HTTP.delete<ApiRespose<null>>(`/api/giftcodes/items?id=${itemId}`),

  addItem: async (body: unknown) =>
    await HTTP.post<ApiRespose<unknown>>(`/api/giftcodes/items`, { body }),

  updateOption: async (optionId: number, body: unknown) =>
    await HTTP.put<ApiRespose<giftcode_item_options>>(
      `/api/giftcodes/options?id=${optionId}`,
      { body },
    ),

  addOption: async (id: number, body: unknown) =>
    await HTTP.post<ApiRespose<any>>(`/api/giftcodes/options?id=${id}`, {
      body,
    }),

  create: async (body: unknown) =>
    await HTTP.post<ApiRespose<unknown>>("/api/giftcodes", { body }),

  getById: async (id: number) =>
    await HTTP.get<ApiRespose<any[]>>(`/api/giftcodes/${id}`),

  delete: async (id: number) =>
    await HTTP.delete<ApiRespose<null>>(`/api/giftcodes?id=${id}`),

  update: async (id: number, data: unknown) =>
    (await HTTP.put)<ApiRespose<Partial<giftcode>>>(
      `/api/giftcodes?id=${id}`,
      data,
    ),
};
