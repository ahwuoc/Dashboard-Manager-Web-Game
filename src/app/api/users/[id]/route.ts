import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const user = await prisma.account.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!user) {
    return NextResponse.json(
      { message: "User chạy mất tiêu rồi!" },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: user });
}
