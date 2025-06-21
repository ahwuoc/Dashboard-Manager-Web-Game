export const parseJson = <T>(
  jsonString: string | null | undefined,
): T | null => {
  if (!jsonString || typeof jsonString !== "string") {
    return null;
  }
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.error("Lỗi parse JSON đơn giản:", jsonString, e);
    return null;
  }
};

const safeJsonParseForItems = <T>(jsonString: string): T | null => {
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.log(e);
    return null;
  }
};

/**
 * Phân tích chuỗi dữ liệu vật phẩm phức tạp, lồng nhau nhiều lớp.
 * Dùng cho các trường items_body, items_bag, items_box.
 * @param rawData Chuỗi JSON gốc từ database.
 * @returns Một mảng các object vật phẩm đã được phân tích.
 */
export const parseItemsData = (rawData: string | null | undefined) => {
  if (!rawData) return [];

  const itemStrings = safeJsonParseForItems<string[]>(rawData);
  if (!itemStrings) return [];

  const parsedItems = itemStrings
    .map((itemStr) => {
      // Lớp 2: Parse từng chuỗi item
      const itemArr = safeJsonParseForItems<unknown[]>(itemStr);
      if (!itemArr) return null;

      // Lớp 3: Parse chuỗi options lồng bên trong
      let options = [];
      if (typeof itemArr[2] === "string") {
        let tempOptions: unknown = itemArr[2];
        try {
          while (typeof tempOptions === "string" && tempOptions.includes("[")) {
            tempOptions = JSON.parse(tempOptions);
          }
          options = Array.isArray(tempOptions) ? tempOptions : [];
        } catch (e) {
          console.log(e);
          options = [itemArr[2]];
        }
      }

      return {
        id: itemArr[0] as number,
        quantity: itemArr[1] as number,
        options: options,
        expiry: itemArr[3] as number,
      };
    })
    .filter((item) => item !== null && item.id !== -1);

  return parsedItems as {
    id: number;
    quantity: number;
    options: unknown[];
    expiry: number;
  }[];
};
