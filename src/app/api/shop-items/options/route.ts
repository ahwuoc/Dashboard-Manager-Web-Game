import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// DELETE - Xóa option
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { item_shop_id, option_id } = body;

    // Validate input
    if (!item_shop_id || !option_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu thông tin bắt buộc: item_shop_id và option_id",
          data: null,
        },
        { status: 400 },
      );
    }

    // Kiểm tra option có tồn tại không
    const existingOption = await prisma.item_shop_option.findUnique({
      where: {
        item_shop_id_option_id: {
          item_shop_id,
          option_id,
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
          message: `Không tìm thấy option với khóa [${item_shop_id}, ${option_id}]`,
          data: null,
        },
        { status: 404 },
      );
    }

    // Xóa option
    await prisma.item_shop_option.delete({
      where: {
        item_shop_id_option_id: {
          item_shop_id,
          option_id,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Xóa option thành công!",
      data: existingOption,
    });
  } catch (error: unknown) {
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

// POST - Tạo option mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { item_shop_id, option_id, param } = body;

    // Validate input
    if (!item_shop_id || !option_id || param === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu thông tin bắt buộc: item_shop_id, option_id và param",
          data: null,
        },
        { status: 400 },
      );
    }

    // Kiểm tra item_shop có tồn tại
    const itemShop = await prisma.item_shop.findUnique({
      where: { id: item_shop_id },
    });

    if (!itemShop) {
      return NextResponse.json(
        {
          success: false,
          message: `Không tìm thấy shop item với ID: ${item_shop_id}`,
          data: null,
        },
        { status: 404 },
      );
    }

    // Kiểm tra option_template có tồn tại
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

    // Tạo option mới
    const newOption = await prisma.item_shop_option.create({
      data: {
        item_shop_id,
        option_id,
        param,
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

// PUT - Cập nhật option
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { item_shop_id, option_id, new_option_id, param } = body;

    // Validate input
    if (!item_shop_id || !option_id || param === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu thông tin bắt buộc: item_shop_id, option_id và param",
          data: null,
        },
        { status: 400 },
      );
    }

    // Kiểm tra option hiện tại có tồn tại không
    const existingOption = await prisma.item_shop_option.findUnique({
      where: {
        item_shop_id_option_id: {
          item_shop_id,
          option_id,
        },
      },
    });

    if (!existingOption) {
      return NextResponse.json(
        {
          success: false,
          message: `Không tìm thấy option với khóa [${item_shop_id}, ${option_id}]`,
          data: null,
        },
        { status: 404 },
      );
    }
    if (new_option_id && new_option_id !== option_id) {
      const newOptionTemplate = await prisma.item_option_template.findUnique({
        where: { id: new_option_id },
      });

      if (!newOptionTemplate) {
        return NextResponse.json(
          {
            success: false,
            message: `Không tìm thấy option template với ID: ${new_option_id}`,
            data: null,
          },
          { status: 404 },
        );
      }
      // Xóa option cũ và tạo option mới (vì khóa chính thay đổi)
      await prisma.$transaction([
        prisma.item_shop_option.delete({
          where: {
            item_shop_id_option_id: {
              item_shop_id,
              option_id,
            },
          },
        }),
        prisma.item_shop_option.create({
          data: {
            item_shop_id,
            option_id: new_option_id,
            param,
          },
        }),
      ]);
    } else {
      // Chỉ cập nhật param
      await prisma.item_shop_option.update({
        where: {
          item_shop_id_option_id: {
            item_shop_id,
            option_id,
          },
        },
        data: {
          param,
        },
      });
    }

    // Lấy option đã cập nhật
    const updatedOption = await prisma.item_shop_option.findUnique({
      where: {
        item_shop_id_option_id: {
          item_shop_id,
          option_id: new_option_id || option_id,
        },
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
    return NextResponse.json({
      success: true,
      message: "Cập nhật option thành công!",
      data: updatedOption,
    });
  } catch (error: unknown) {
    console.error("Lỗi khi cập nhật option:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Lỗi server khi cập nhật option",
        data: null,
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    );
  }
}
