import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search");

  try {
    const items = await prisma.item_template.findMany({
      where: search
        ? {
            NAME: {
              contains: search,
            },
          }
        : undefined,
    });

    return NextResponse.json({ data: items }, { status: 200 });
  } catch (error) {
    console.error("Lỗi khi tìm item:", error);
    return NextResponse.json(
      { message: "Lỗi khi truy vấn dữ liệu." },
      { status: 500 },
    );
  }
}
