"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Input,
  Button,
  Modal,
  Space,
  Typography,
  message,
  Popconfirm,
  Tag,
  Row,
  Col,
  Statistic,
  Spin,
  Form,
  InputNumber,
  Switch,
} from "antd";
import {
  EditOutlined,
  UserOutlined,
  DeleteOutlined,
  GiftOutlined,
  SearchOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { apiUser } from "@/app/handler/apiUsers";
import { account } from "@/generated/prisma";
import Link from "next/link";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;
const { Search } = Input;

export default function UserManagementPage() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<account | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [users, setUsers] = useState<account[]>([]);
  const [loading, setLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiUser.getAll();
      if (response.payload) {
        setUsers(response.payload.data);
      }
    } catch (error) {
      console.error("Lỗi khi fetch dữ liệu user:", error);
      messageApi.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(search.toLowerCase()) ||
      user.id?.toString().includes(search.toLowerCase()),
  );

  const handleEditClick = (user: account) => {
    setSelectedUser(user);
    form.setFieldsValue({
      username: user.username,
      coin: user.coin,
      tongnap: user.tongnap,
      is_admin: user.is_admin,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (values: any) => {
    if (!selectedUser) return;

    try {
      setEditLoading(true);
      // Gọi API update user ở đây
      // const response = await apiUser.update(selectedUser.id, values);

      // Cập nhật local state
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id ? { ...user, ...values } : user,
        ),
      );

      messageApi.success("Cập nhật thông tin user thành công!");
      setIsEditModalOpen(false);
      setSelectedUser(null);
      form.resetFields();
    } catch (error) {
      console.error("Lỗi khi cập nhật user:", error);
      messageApi.error("Không thể cập nhật thông tin user");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const response = await apiUser.delete(userId);

      if (response.status === 200) {
        setUsers(users.filter((user) => user.id !== userId));
        messageApi.success("Xóa user thành công!");
      } else {
        messageApi.error("Xóa user thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi xóa user:", error);
      messageApi.error("Đã có lỗi xảy ra khi xóa user");
    }
  };

  const columns: ColumnsType<account> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
      render: (id: number) => <Text code>{id}</Text>,
    },
    {
      title: "Tên người dùng",
      dataIndex: "username",
      key: "username",
      sorter: (a, b) => (a.username || "").localeCompare(b.username || ""),
      render: (username: string) => (
        <Space>
          <UserOutlined />
          <Text strong>{username || "N/A"}</Text>
        </Space>
      ),
    },
    {
      title: "Quyền Admin",
      dataIndex: "is_admin",
      key: "is_admin",
      width: 120,
      filters: [
        { text: "Admin", value: true },
        { text: "User", value: false },
      ],
      onFilter: (value, record) => record.is_admin === value,
      render: (isAdmin: boolean) => (
        <Tag color={isAdmin ? "red" : "blue"}>{isAdmin ? "Admin" : "User"}</Tag>
      ),
    },
    {
      title: "Coin",
      dataIndex: "coin",
      key: "coin",
      width: 120,
      sorter: (a, b) => (a.coin || 0) - (b.coin || 0),
      render: (coin: number) => (
        <Text strong style={{ color: "#faad14" }}>
          {(coin || 0).toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Tổng nạp",
      dataIndex: "tongnap",
      key: "tongnap",
      width: 120,
      sorter: (a, b) => (a.tongnap || 0) - (b.tongnap || 0),
      render: (tongnap: number) => (
        <Text strong style={{ color: "#52c41a" }}>
          {(tongnap || 0).toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditClick(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa người dùng"
            description={`Bạn có chắc chắn muốn xóa user "${record.username}"?`}
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Có"
            cancelText="Không"
            okType="danger"
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
          <Link href={`user/gift?id=${record.id}`}>
            <Button
              type="default"
              size="small"
              icon={<GiftOutlined />}
              style={{ color: "#722ed1", borderColor: "#722ed1" }}
            >
              Tặng Quà
            </Button>
          </Link>
        </Space>
      ),
    },
  ];

  // Tính toán thống kê
  const totalUsers = users.length;
  const adminUsers = users.filter((user) => user.is_admin).length;
  const totalCoins = users.reduce((sum, user) => sum + (user.coin || 0), 0);
  const totalDeposits = users.reduce(
    (sum, user) => sum + (user.tongnap || 0),
    0,
  );

  return (
    <div style={{ padding: "24px" }}>
      {contextHolder}

      {/* Header với thống kê */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Space align="center">
              <TeamOutlined style={{ fontSize: "32px", color: "#1890ff" }} />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Quản lý User
                </Title>
                <Text type="secondary">
                  Quản lý thông tin và quyền hạn người dùng
                </Text>
              </div>
            </Space>
          </Col>
          <Col span={12}>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Tổng Users"
                  value={totalUsers}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Admin"
                  value={adminUsers}
                  valueStyle={{ color: "#f5222d" }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Tổng Coin"
                  value={totalCoins}
                  valueStyle={{ color: "#faad14" }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Tổng Nạp"
                  value={totalDeposits}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Bảng dữ liệu */}
      <Card>
        <div style={{ marginBottom: "16px" }}>
          <Search
            placeholder="Tìm kiếm theo ID hoặc tên người dùng..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: "400px" }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} người dùng`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          scroll={{ x: 800 }}
          size="middle"
          bordered
          locale={{
            emptyText: loading ? (
              <Spin tip="Đang tải dữ liệu..." />
            ) : (
              <div style={{ textAlign: "center", padding: "50px 0" }}>
                <UserOutlined style={{ fontSize: "48px", color: "#d9d9d9" }} />
                <div style={{ marginTop: "16px", color: "#999" }}>
                  Không tìm thấy người dùng nào
                </div>
              </div>
            ),
          }}
        />
      </Card>

      {/* Modal chỉnh sửa */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            Chỉnh sửa thông tin User
          </Space>
        }
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedUser && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleEditSubmit}
            initialValues={{
              username: selectedUser.username,
              coin: selectedUser.coin,
              tongnap: selectedUser.tongnap,
              is_admin: selectedUser.is_admin,
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Tên người dùng"
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập tên người dùng!",
                    },
                    {
                      min: 3,
                      message: "Tên người dùng phải có ít nhất 3 ký tự!",
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Nhập tên người dùng"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Quyền Admin"
                  name="is_admin"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Admin" unCheckedChildren="User" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Coin"
                  name="coin"
                  rules={[
                    { required: true, message: "Vui lòng nhập số coin!" },
                    {
                      type: "number",
                      min: 0,
                      message: "Coin phải lớn hơn hoặc bằng 0!",
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="Nhập số coin"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Tổng nạp"
                  name="tongnap"
                  rules={[
                    { required: true, message: "Vui lòng nhập tổng nạp!" },
                    {
                      type: "number",
                      min: 0,
                      message: "Tổng nạp phải lớn hơn hoặc bằng 0!",
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="Nhập tổng nạp"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
              <Space>
                <Button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedUser(null);
                    form.resetFields();
                  }}
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={editLoading}
                  icon={<EditOutlined />}
                >
                  {editLoading ? "Đang cập nhật..." : "Cập nhật"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
