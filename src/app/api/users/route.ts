import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await prisma.account.findMany();
    return NextResponse.json({ data: users });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    return NextResponse.json(
      { message: "Không thể lấy danh sách người dùng." },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { message: "Thiếu ID người dùng cần xóa." },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.account.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json(
      { message: "Xóa người dùng thành công.", data: user },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error(`Lỗi khi xóa người dùng với ID ${id}:`, error);
    return NextResponse.json(
      { message: "Không thể xóa người dùng do lỗi server nội bộ." },
      { status: 500 },
    );
  }
}
