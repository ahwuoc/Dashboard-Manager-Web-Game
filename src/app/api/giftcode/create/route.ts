import { NextResponse } from "next/server";
import { query } from "../../../database/db";
import { format } from "date-fns";

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const { code, count, expired, detail } = requestBody.body;

    // Nếu không có expired, tự động lấy thời gian hiện tại
    const formattedExpired = expired
      ? format(new Date(expired), "yyyy-MM-dd HH:mm:ss")
      : format(new Date(), "yyyy-MM-dd HH:mm:ss");

    console.log("Formatted expired:", formattedExpired);

    // Kiểm tra dữ liệu đầu vào
    if (!Array.isArray(detail) || detail.length === 0) {
      return NextResponse.json(
        { error: "Detail must be a non-empty array" },
        { status: 400 }
      );
    }

    // Thực hiện truy vấn INSERT
    const result = await query(
      "INSERT INTO giftcode (code, count_left, detail, expired, type) VALUES (?, ?, ?, ?, ?)",
      [code, count, JSON.stringify(detail), formattedExpired, 0]
    );

    return NextResponse.json(
      { success: true, message: "Giftcode created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating data:", error);
    return NextResponse.json(
      { error: "Failed to create data" },
      { status: 500 }
    );
  }
}
