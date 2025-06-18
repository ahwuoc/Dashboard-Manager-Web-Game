import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const result = await prisma.giftcode.findMany({
      orderBy: { id: "desc" },
      include: {
        giftcode_items: {
          include: {
            item_template: {
              select: {
                id: true,
                NAME: true,
              },
            },
            giftcode_item_options: {
              include: {
                item_option_template: {
                  select: {
                    id: true,
                    NAME: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const idStr = url.searchParams.get("id");
    if (!idStr) {
      return NextResponse.json({ message: "Thiếu id" }, { status: 400 });
    }
    const id = parseInt(idStr);
    if (isNaN(id)) {
      return NextResponse.json({ message: "id không hợp lệ" }, { status: 400 });
    }

    // Xóa giftcode_items trước nếu có quan hệ foreign key (nếu DB set cascade thì ko cần)
    await prisma.giftcode_items.deleteMany({ where: { giftcode_id: id } });

    // Xóa giftcode
    await prisma.giftcode.delete({ where: { id } });

    return NextResponse.json({ message: "Xóa giftcode thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa giftcode:", error);
    return NextResponse.json(
      { message: "Lỗi khi xóa giftcode", error: String(error) },
      { status: 500 },
    );
  }
}
export async function POST(request: Request) {
  try {
    const { body } = await request.json();
    const createGiftcode = await prisma.giftcode.create({
      data: {
        code: body.code,
        count_left: body.count_left,
        expired: body.expired,
      },
      include: {
        giftcode_items: true,
      },
    });
    return NextResponse.json({
      message: "Tạo giftcode thành công",
      data: createGiftcode,
    });
  } catch (error) {
    console.error("Lỗi khi tạo giftcode:", error);
    return NextResponse.json(
      { message: "Lỗi khi tạo giftcode", error: String(error) },
      { status: 500 },
    );
  }
}
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get("id") || "");

    const body = await request.json();

    const updated = await prisma.giftcode.update({
      where: { id },
      data: {
        code: body.code,
        count_left: body.count_left,
        expired: body.expired,
      },
    });

    return NextResponse.json({
      message: "✅ Cập nhật thành công",
      data: updated,
    });
  } catch (error) {
    console.error("❌ Lỗi cập nhật giftcode:", error);
    return NextResponse.json(
      { message: "Lỗi khi cập nhật giftcode", error: String(error) },
      { status: 500 },
    );
  }
}
