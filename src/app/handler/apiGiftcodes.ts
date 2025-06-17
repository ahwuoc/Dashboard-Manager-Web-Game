import { giftcode_item_options } from "@/generated/prisma";
import { GiftcodeItemWithOptions } from "../admin/giftcodes/[id]/page";
import HTTP from "../common/http";
import { GiftcodeWithItemsAndOptions } from "../admin/giftcodes/page";

type ApiRespose<T> = {
  data: T;
  message: string;
};

export const apiGiftcode = {
  getAll: async () =>
    await HTTP.get<ApiRespose<GiftcodeWithItemsAndOptions[]>>("/api/giftcodes"),

  getDetail: async (id: string) =>
    await HTTP.get<ApiRespose<GiftcodeItemWithOptions>>(`/giftcode/${id}`),

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
    await HTTP.post<ApiRespose<unknown>>(`/api/giftcodes/options?id=${id}`, {
      body,
    }),

  create: async (body: unknown) =>
    await HTTP.post<ApiRespose<unknown>>("/api/giftcodes", { body }),

  getById: async (id: number) =>
    await HTTP.get<ApiRespose<GiftcodeItemWithOptions[]>>(
      `/api/giftcodes/${id}`,
    ),

  delete: async (id: number) =>
    await HTTP.delete<ApiRespose<null>>(`/api/giftcodes?id=${id}`),

  update: async (id: number, data: unknown) =>
    await HTTP.post<ApiRespose<unknown>>(`/giftcode/update/${id}`, data),
};
