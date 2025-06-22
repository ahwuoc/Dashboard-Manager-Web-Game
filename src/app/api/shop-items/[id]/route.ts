import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// DELETE - Xóa item_shop
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numericId = Number(id);

  try {
    await prisma.item_shop.delete({
      where: { id: numericId },
    });

    return NextResponse.json({ message: "Item shop đã được xóa!" });
  } catch (error) {
    return NextResponse.json(
      { message: "Không thể xóa item shop!", error },
      { status: 500 },
    );
  }
}

// PUT - Cập nhật item_shop
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numericId = Number(id);
  const body = await request.json();

  try {
    const updatedItem = await prisma.item_shop.update({
      where: { id: numericId },
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

    return NextResponse.json({ data: updatedItem });
  } catch (error) {
    return NextResponse.json(
      { message: "Không thể cập nhật item_shop!", error },
      { status: 500 },
    );
  }
}

// GET - Lấy danh sách option của item_shop
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numericId = parseInt(id);

  const itemOptions = await prisma.item_shop_option.findMany({
    where: { item_shop_id: numericId },
    include: {
      item_option_template: true,
    },
  });

  if (!itemOptions || itemOptions.length === 0) {
    return NextResponse.json(
      { message: "Không tìm thấy item option nào!" },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: itemOptions });
}
