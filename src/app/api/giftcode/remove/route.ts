import { NextResponse } from "next/server";
import { query } from "@/app/database/db";

// Sử dụng POST thay vì DELETE
export async function POST(
  request: Request
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  const requestBody = await request.json(); // Lấy body từ request
  const { id } = requestBody; // Giả sử body chứa { id: string }

  if (!id) {
    return NextResponse.json({ error: "Missing giftcode ID" }, { status: 400 });
  }

  try {
    const result = await query("DELETE FROM giftcode WHERE id = ?", [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting giftcode:", error);
    return NextResponse.json(
      { error: "Failed to delete giftcode" },
      { status: 500 }
    );
  }
}
