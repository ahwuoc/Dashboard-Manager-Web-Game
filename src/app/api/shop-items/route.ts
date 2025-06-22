import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function GET() {
  const items = await prisma.item_shop.findMany();
  return NextResponse.json({ data: items });
}
export async function POST(request: NextRequest) {
  const body = await request.json();
  try {
    const newItem = await prisma.item_shop.create({
      data: {
        temp_id: body.temp_id,
        is_new: body.is_new,
        tab_id: body.tab_id,
        is_sell: body.is_sell,
        type_sell: body.type_sell,
        cost: body.cost,
        icon_spec: body.icon_spec,
      },
    });

    return NextResponse.json({ data: newItem });
  } catch (error) {
    return NextResponse.json(
      { message: "Không thể tạo mới item_shop!", error },
      { status: 500 },
    );
  }
}
