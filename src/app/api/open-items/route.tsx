import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await prisma.box_item_actions.findMany({
      include: {
        item_template: {
          select: {
            NAME: true,
          },
        },
        box_item_drops: {
          include: {
            item_template: {
              select: {
                NAME: true,
              },
            },
            box_item_drop_options: {
              include: {
                item_option_template: true,
              },
            },
          },
        },
      },
    });
    return NextResponse.json({ data: data });
  } catch (error) {
    console.error("Error fetching box actions:", error);
    return NextResponse.json(
      { isSuccess: false, message: "Lỗi máy chủ nội bộ." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { template_item_id, open_mode, box_item_drops } = body;

    if (!template_item_id || !open_mode || !box_item_drops) {
      return NextResponse.json(
        { isSuccess: false, message: "Dữ liệu đầu vào không hợp lệ." },
        { status: 400 },
      );
    }
    await prisma.box_item_actions.create({
      data: {
        template_item_id,
        open_mode,
        box_item_drops: {
          create: box_item_drops.map((drop: any) => ({
            item_template_id: drop.item_template_id,
            quantity_min: drop.quantity_min,
            quantity_max: drop.quantity_max,
            drop_rate: drop.drop_rate,
            box_item_drop_options: {
              create: drop.box_item_drop_options.map((option: any) => ({
                option_id: option.option_id,
                option_param: option.option_param,
              })),
            },
          })),
        },
      },
    });

    return NextResponse.json(
      {
        isSuccess: true,
        message: "Tạo hành động thành công!",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating box action:", error);
    return NextResponse.json(
      { isSuccess: false, message: "Lỗi máy chủ nội bộ." },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const actionId = request.nextUrl.searchParams.get("id");
    const body = await request.json();
    const { template_item_id, open_mode, box_item_drops } = body;

    if (!template_item_id || !open_mode || !box_item_drops) {
      return NextResponse.json(
        { isSuccess: false, message: "Dữ liệu đầu vào không hợp lệ." },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.box_item_drops.deleteMany({
        where: {
          box_action_id: Number(actionId),
        },
      });

      const action = await tx.box_item_actions.update({
        where: {
          id: Number(actionId),
        },
        data: {
          template_item_id,
          open_mode,
          box_item_drops: {
            create: box_item_drops.map((drop: any) => ({
              item_template_id: drop.item_template_id,
              quantity_min: drop.quantity_min,
              quantity_max: drop.quantity_max,
              drop_rate: drop.drop_rate,
              box_item_drop_options: {
                create: drop.box_item_drop_options.map((option: any) => ({
                  option_id: option.option_id,
                  option_param: option.option_param,
                })),
              },
            })),
          },
        },
        include: {
          box_item_drops: {
            include: {
              box_item_drop_options: true,
            },
          },
        },
      });

      return action;
    });

    return NextResponse.json(
      {
        isSuccess: true,
        message: "Cập nhật hành động thành công!",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("lỗi", error);
    return NextResponse.json(
      { isSuccess: false, message: "Lỗi máy chủ nội bộ." },
      { status: 500 },
    );
  }
}
