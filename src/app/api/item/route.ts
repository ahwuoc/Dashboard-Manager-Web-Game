import { NextResponse } from "next/server";
import { query } from "@/app/database/db";

export async function GET() {
  try {
    const result = await query("SELECT * FROM item_template");
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
