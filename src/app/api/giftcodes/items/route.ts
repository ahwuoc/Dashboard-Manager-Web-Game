import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { body } = await request.json();
    console.log("data POST", body);
    const create = await prisma.giftcode_items.create({
      data: {
        giftcode_id: body.giftcode_id,
        quantity: body.quantity,
        item_id: body.item_id,
      },
    });

    return NextResponse.json({ message: "Tạo thành công", data: create });
  } catch (error) {
    console.error("Lỗi khi tạo giftcode_items:", error);
    return NextResponse.json(
      { message: "Có lỗi xảy ra", error: String(error) },
      { status: 500 },
    );
  }
}
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const idStr = url.searchParams.get("id");
    if (!idStr) {
      return NextResponse.json({ message: "Thiếu id!" }, { status: 400 });
    }
    const id = parseInt(idStr);
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "ID không hợp lệ!" },
        { status: 400 },
      );
    }

    await prisma.giftcode_items.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Xóa thành công item id " + id });
  } catch (error) {
    console.error("Lỗi khi xóa giftcode_item:", error);
    return NextResponse.json(
      { message: "Có lỗi xảy ra khi xóa!", error: String(error) },
      { status: 500 },
    );
  }
}
