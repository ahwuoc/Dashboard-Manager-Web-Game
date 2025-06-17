import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numericId = parseInt(id);
  const itemOptions = await prisma.giftcode_items.findMany({
    where: { giftcode_id: numericId },
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
  });

  if (!itemOptions || itemOptions.length === 0) {
    return NextResponse.json(
      { message: "Không tìm thấy item option nào!" },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: itemOptions });
}
