import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function GET() {
  const items = await prisma.item_shop.findMany();
  return NextResponse.json({ data: items });
}
