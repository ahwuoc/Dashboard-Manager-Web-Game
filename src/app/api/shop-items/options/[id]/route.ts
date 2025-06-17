import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// ==================== GET ====================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);

    const itemShop = await prisma.item_shop.findUnique({
      where: { id: parsedId },
    });

    if (!itemShop) {
      return NextResponse.json(
        {
          success: false,
          message: `Không tìm thấy shop item với ID: ${id}`,
          data: null,
        },
        { status: 404 },
      );
    }

    const itemOptions = await prisma.item_shop_option.findMany({
      where: { item_shop_id: parsedId },
      include: {
        item_option_template: {
          select: {
            id: true,
            NAME: true,
          },
        },
      },
      orderBy: [{ option_id: "asc" }],
    });

    return NextResponse.json({
      success: true,
      message:
        itemOptions.length > 0
          ? `Tìm thấy ${itemOptions.length} option(s) cho item ${id}`
          : `Item ${id} chưa có option nào`,
      data: itemOptions,
      meta: {
        total: itemOptions.length,
        item_shop_id: id,
        item_shop_info: {
          id: itemShop.id,
          temp_id: itemShop.temp_id,
          is_sell: itemShop.is_sell,
        },
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy item options:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Lỗi server khi lấy danh sách options",
        data: null,
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    );
  }
}

// ==================== POST ====================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { option_id, param } = body;
    const numericId = parseInt(id);

    if (!option_id || param === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu thông tin bắt buộc: option_id và param",
          data: null,
        },
        { status: 400 },
      );
    }

    const itemShop = await prisma.item_shop.findUnique({
      where: { id: numericId },
    });

    if (!itemShop) {
      return NextResponse.json(
        {
          success: false,
          message: `Không tìm thấy shop item với ID: ${id}`,
          data: null,
        },
        { status: 404 },
      );
    }

    const optionTemplate = await prisma.item_option_template.findUnique({
      where: { id: option_id },
    });

    if (!optionTemplate) {
      return NextResponse.json(
        {
          success: false,
          message: `Không tìm thấy option template với ID: ${option_id}`,
          data: null,
        },
        { status: 404 },
      );
    }

    const newOption = await prisma.item_shop_option.create({
      data: {
        item_shop_id: numericId,
        option_id: option_id,
        param: param,
      },
      include: {
        item_option_template: {
          select: {
            id: true,
            NAME: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Tạo option thành công!",
        data: newOption,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Lỗi khi tạo option:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Lỗi server khi tạo option",
        data: null,
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    );
  }
}

// ==================== DELETE ====================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const option_id = Number(searchParams.get("option_id"));

    if (
      isNaN(numericId) ||
      numericId <= 0 ||
      isNaN(option_id) ||
      option_id <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "ID không hợp lệ!",
          data: null,
        },
        { status: 400 },
      );
    }

    const existingOption = await prisma.item_shop_option.findUnique({
      where: {
        item_shop_id_option_id: {
          item_shop_id: numericId,
          option_id: option_id,
        },
      },
      include: {
        item_option_template: true,
      },
    });

    if (!existingOption) {
      return NextResponse.json(
        {
          success: false,
          message: `Không tìm thấy option với khóa [${id}, ${option_id}]`,
          data: null,
        },
        { status: 404 },
      );
    }

    await prisma.item_shop_option.delete({
      where: {
        item_shop_id_option_id: {
          item_shop_id: numericId,
          option_id: option_id,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Xóa option [${id}, ${option_id}] thành công!`,
      data: existingOption,
    });
  } catch (error) {
    console.error("Lỗi khi xóa option:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Lỗi server khi xóa option",
        data: null,
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    );
  }
}
