import { GiftcodeItemType } from "@/app/common/constant";

export const getGiftcodeItemTypeName = (type: number | null | undefined) => {
  if (type === null || type === undefined) return "N/A";
  switch (type) {
    case GiftcodeItemType.Ngoc:
      return "Ngọc";
    case GiftcodeItemType.VatPhamDacBiet:
      return "Vật phẩm đặc biệt";
    case GiftcodeItemType.HongNgoc:
      return "Hồng Ngọc";
    case GiftcodeItemType.Coupon:
      return "Coupon";
    case GiftcodeItemType.Vang:
      return "Vàng";
    default:
      return `Không xác định (${type})`;
  }
};
