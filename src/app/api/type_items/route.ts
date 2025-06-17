import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await prisma.type_item.findMany();
    return NextResponse.json({ data: data });
  } catch (error) {
    console.error("Lỗi khi lấy type_item:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
