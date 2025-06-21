import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const user = await prisma.account.findUnique({
    where: { id: Number(id) },
  });

  if (!user) {
    return NextResponse.json(
      { message: "User chạy mất tiêu rồi!" },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: user });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  try {
    const updated = await prisma.account.update({
      where: { id: Number(id) },
      data: {
        username: body.name,
        is_admin: body.is_admin,
        ban: body.ban,
        coin: body.coin,
        active: body.active,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("PUT update failed:", error);
    return NextResponse.json(
      { message: "Cập nhật thất bại!" },
      { status: 500 },
    );
  }
}
