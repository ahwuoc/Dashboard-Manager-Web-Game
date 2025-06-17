import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const result = await prisma.giftcode.findMany({
      orderBy: { id: "desc" },
    });
    const cleanedData = result.map((row) => ({
      ...row,
      detail: JSON.parse(row.detail),
    }));

    return NextResponse.json(cleanedData);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}
