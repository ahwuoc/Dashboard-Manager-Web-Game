import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const result = await prisma.player.findMany({
      select: {
        id: true,
        name: true,
        data_point: true,
        data_task: true,
        items_body: true,
        items_bag: true,
        items_box: true,
        gender: true,
        data_inventory: true,
      },
    });
    console.log("Data", result);
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
