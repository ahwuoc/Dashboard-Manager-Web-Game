import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function POST(request: Request) {
  try {
    const { code, count, expired, detail } = await request.json();

    // Format thời gian hết hạn
    const formattedExpired = expired ? new Date(expired) : new Date();
    if (!Array.isArray(detail) || detail.length === 0) {
      return NextResponse.json(
        { error: "Detail must be a non-empty array" },
        { status: 400 },
      );
    }
    const result = await prisma.giftcode.create({
      data: {
        code,
        count_left: count,
        detail: JSON.stringify(detail),
        expired: formattedExpired,
        itemoption: JSON.stringify({}),
        datecreate: new Date(),
      },
    });

    return NextResponse.json(
      { success: true, message: "Giftcode created successfully", result },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating data:", error);
    return NextResponse.json(
      { error: "Failed to create data" },
      { status: 500 },
    );
  }
}
