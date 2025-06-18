import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface Payload {
  is_admin: boolean;
}
function decodePayload(token: string): Payload | null {
  try {
    const base64 = token.split(".")[1];
    const decoded = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export default function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;

  console.log(token);
  console.log("Middleware chạy vào:", pathname);

  const isLoginPage = pathname === "/pages/login";
  const isAdminPage = pathname.startsWith("/admin");

  const payload = token ? decodePayload(token) : null;

  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (isAdminPage && (!token || !payload)) {
    return NextResponse.redirect(new URL("/pages/login", request.url));
  }

  if (isAdminPage && payload && !payload.is_admin) {
    return NextResponse.redirect(new URL("/pages/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/pages/login"],
};
