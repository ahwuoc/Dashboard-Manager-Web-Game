"use client";
import { Result, Button } from "antd";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Result
        status="403"
        title="403 - Không có quyền truy cập"
        subTitle="Bạn không được phép truy cập trang này. Vui lòng đăng nhập hoặc quay lại trang chính."
        extra={
          <Button type="primary" onClick={() => router.push("/")}>
            Về trang chủ
          </Button>
        }
      />
    </div>
  );
}
