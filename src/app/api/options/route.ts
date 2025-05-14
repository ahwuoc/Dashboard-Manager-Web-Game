import { NextResponse } from "next/server";
import { query } from "../../database/db";

export async function GET(request: Request) {
  try {
    const result = await query("SELECT * FROM   item_option_template");
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
