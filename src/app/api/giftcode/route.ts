import { NextResponse } from "next/server";
import { query } from "@/app/database/db";

type GiftcodeRow = {
  id: number;
  detail: string; // lúc này vẫn là JSON string
  // thêm các field khác nếu có
};

export async function GET() {
  try {
    const result = (await query(
      "SELECT * FROM giftcode ORDER BY id DESC"
    )) as GiftcodeRow[];
    const cleanedData = result.map((row) => ({
      ...row,
      detail: JSON.parse(row.detail),
    }));

    return NextResponse.json(cleanedData);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
