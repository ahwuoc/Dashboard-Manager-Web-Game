  import { NextResponse } from "next/server";
  import { query } from "@/app/database/db";
  export async function GET(request: Request) {
    try {
      const result = await query("SELECT * FROM giftcode ORDER BY id DESC");

      const cleanedData = result.map((row: any) => ({
        ...row,
        detail: JSON.parse(row.detail), // parse JSON string → object
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
