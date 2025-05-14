import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/database/db";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search");

  let queryStr = "SELECT * FROM item_template";
  const params: unknown[] = [];

  if (search) {
    queryStr += " WHERE NAME LIKE ?";
    params.push(`%${search}%`);
  }

  try {
    const result = await query(queryStr, params);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Lỗi khi truy vấn dữ liệu." },
      { status: 500 }
    );
  }
}
