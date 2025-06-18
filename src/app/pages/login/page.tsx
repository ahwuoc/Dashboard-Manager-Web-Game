"use client";

import type { account } from "@/generated/prisma";
import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { apiAuth } from "@/app/handler/apiAuth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();

  const onFinish = async (values: account) => {
    try {
      const result = await apiAuth.login(values);
      if (result) {
        messageApi.success("Đăng nhập thành công!");
        router.push("/admin");
      }
    } catch (error) {
      messageApi.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!");
      console.error("Login error:", error);
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4 py-8 sm:px-6 lg:px-8">
      {contextHolder}
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md sm:p-8 sm:max-w-md lg:p-10 lg:shadow-xl">
        <h1 className="text-center mb-6 text-2xl font-bold text-gray-700 sm:text-3xl lg:text-4xl">
          Đăng Nhập
        </h1>
        <Form
          name="normal_login"
          className="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên người dùng!" },
            ]}
          >
            <Input
              prefix={
                <UserOutlined className="site-form-item-icon text-base sm:text-lg" />
              }
              placeholder="Tên người dùng"
              className="py-2 px-3 sm:py-3 sm:px-4 text-base sm:text-lg" // Tăng kích thước input
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input
              prefix={
                <LockOutlined className="site-form-item-icon text-base sm:text-lg" />
              }
              type="password"
              placeholder="Mật khẩu"
              className="py-2 px-3 sm:py-3 sm:px-4 text-base sm:text-lg" // Tăng kích thước input
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full h-auto py-2.5 text-lg font-semibold sm:py-3 sm:text-xl lg:py-4 lg:text-2xl" // Điều chỉnh kích thước nút
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
