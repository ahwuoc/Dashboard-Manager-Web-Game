import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "Thiếu id!" }, { status: 400 });
    }

    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      return NextResponse.json(
        { message: "ID không hợp lệ!" },
        { status: 400 },
      );
    }

    const { body } = await req.json(); // destructure đúng
    console.log("dataaaa", body);

    // Validate body data
    if (!body.option_id || !body.param) {
      return NextResponse.json(
        { message: "Thiếu option_id hoặc param!" },
        { status: 400 },
      );
    }

    // Ensure numeric values
    const optionId = parseInt(body.option_id);
    const param = parseInt(body.param);

    if (isNaN(optionId) || isNaN(param)) {
      return NextResponse.json(
        { message: "option_id và param phải là số!" },
        { status: 400 },
      );
    }

    console.log("Processed data:", {
      giftcode_item_id: numericId,
      option_id: optionId,
      param: param,
    });

    const result = await prisma.giftcode_item_options.create({
      data: {
        giftcode_item_id: numericId,
        option_id: optionId,
        param: param,
      },
    });

    return NextResponse.json({ message: "Tạo thành công", data: result });
  } catch (error) {
    console.error("Lỗi khi tạo giftcode_item_option:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra khi tạo dữ liệu!", error },
      { status: 500 },
    );
  }
}
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "Thiếu id!" }, { status: 400 });
    }

    console.log("id", id);
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      return NextResponse.json(
        { message: "ID không hợp lệ!" },
        { status: 400 },
      );
    }

    await prisma.giftcode_item_options.delete({
      where: {
        id: numericId,
      },
    });
    return NextResponse.json({
      message: "Xoá thành công!",
    });
  } catch (error) {
    console.error("Lỗi khi xoá giftcode_item_option:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra khi xoá!", error },
      { status: 500 },
    );
  }
}
export async function PUT(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "Thiếu id!" }, { status: 400 });
    }

    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      return NextResponse.json(
        { message: "ID không hợp lệ!" },
        { status: 400 },
      );
    }
    const { body } = await req.json();
    const updated = await prisma.giftcode_item_options.update({
      where: { id: numericId },
      data: {
        option_id: Number(body.option_id),
        param: Number(body.param),
      },
    });

    return NextResponse.json({
      message: "Cập nhật thành công!",
      data: updated,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật giftcode_item_option:", error);
    return NextResponse.json(
      { message: "Đã có lỗi xảy ra khi cập nhật!", error },
      { status: 500 },
    );
  }
}
