import { NextResponse } from "next/server";
import { query } from "@/app/database/db";

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const result = await query("DELETE FROM giftcode WHERE id = ?", [id]);

    return NextResponse.json({
      success: true,
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("Error deleting giftcode:", error);
    return NextResponse.json(
      { error: "Failed to delete giftcode" },
      { status: 500 }
    );
  }
}
