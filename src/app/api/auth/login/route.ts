import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { username, password } = data;
    if (!username || !password) {
      return NextResponse.json(
        { error: "Thiếu thông tin username hoặc password" },
        { status: 400 },
      );
    }
    const login = await prisma.account.findUnique({
      where: {
        username: username,
      },
    });
    if (login && login.password === password) {
      const token = jwt.sign(
        { username: login.username, id: login.id },
        process.env.JWT_SECRET!,
        { expiresIn: "2h" },
      );
      const response = NextResponse.json(
        { token, message: "Đăng nhập thành công" },
        { status: 200 },
      );
      response.cookies.set({
        name: "token",
        value: token,
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60,
      });
      return response;
    } else {
      return NextResponse.json(
        { error: "Username hoặc password không đúng" },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error("Lỗi khi xử lý request:", error);
    return NextResponse.json(
      { error: "Đã có lỗi xảy ra trong quá trình xử lý" },
      { status: 500 },
    );
  }
}
