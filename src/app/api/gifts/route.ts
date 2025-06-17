import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, itemId, quantity, options } = body;
    console.log(body);
    // Tìm player theo account_id
    const player = await prisma.player.findUnique({
      where: { account_id: userId },
    });

    if (!player) {
      return new Response(
        JSON.stringify({ error: "Người chơi không tồn tại" }),
        { status: 404 },
      );
    }
    const receivedItem = await prisma.received_items.create({
      data: {
        player_name: player.name,
        item_id: itemId,
        quantity,
      },
    });
    if (Array.isArray(options)) {
      await Promise.all(
        options.map((option: { id: number; param: number }) =>
          prisma.received_items_options.create({
            data: {
              received_item_id: receivedItem.id,
              option_id: option.id,
              option_value: Number(option.param),
            },
          }),
        ),
      );
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Lỗi khi xử lý request:", error);
    return new Response(JSON.stringify({ error: "Lỗi server" }), {
      status: 500,
    });
  }
}
