import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET() {
  try {
    const result = await prisma.item_option_template.findMany();
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
