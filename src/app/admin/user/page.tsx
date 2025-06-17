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
  GiftOutlined,
  SearchOutlined,
  TeamOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { apiUser } from "@/app/handler/apiUsers";
import { account } from "@/generated/prisma";
import Link from "next/link";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;
const { Search } = Input;

// Định nghĩa lại interface EditUserFormValues
interface EditUserFormValues {
  username: string;
  coin?: number;
  tongnap?: number;
  is_admin?: boolean;
  ban?: boolean; // Vẫn giữ là boolean ở frontend để khớp với Switch
}

export default function UserManagementPage() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<account | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [users, setUsers] = useState<account[]>([]);
  const [loading, setLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<EditUserFormValues>();

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
      // Khi đọc từ Prisma (có thể là number 0/1) sang form (boolean), cần chuyển đổi
      ban: user.ban === 1 ? true : false, // Chuyển 0/1 từ DB sang true/false cho Switch
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (values: EditUserFormValues) => {
    if (!selectedUser) return;

    try {
      setEditLoading(true);

      // Chuyển đổi giá trị 'ban' từ boolean sang number (0 hoặc 1) trước khi gửi
      const dataToSend = {
        ...values,
        ban: values.ban ? 1 : 0, // Convert boolean (true/false) to number (1/0)
      };

      const response = await apiUser.update(selectedUser.id, dataToSend); // Gửi data đã được chuyển đổi

      if (response.payload?.data) {
        // Sau khi update thành công, fetch lại users để đảm bảo UI đồng bộ với DB
        fetchUsers();
        messageApi.success("Cập nhật thông tin user thành công!");
      } else {
        messageApi.error("Cập nhật thông tin user thất bại!");
      }

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

  // Hàm "cấm" người dùng thay vì xóa
  const handleBanUser = async (userId: number, banStatus: boolean) => {
    try {
      // Chuyển đổi trạng thái cấm boolean sang number (0 hoặc 1)
      const statusToSend = banStatus ? 1 : 0; // Convert boolean to number (1 for banned, 0 for not)

      const response = await apiUser.update(userId, { ban: statusToSend }); // Gửi giá trị số

      if (response.payload?.data) {
        // Sau khi thao tác thành công, fetch lại users để cập nhật UI
        fetchUsers();
        messageApi.success(`${banStatus ? "Cấm" : "Bỏ cấm"} user thành công!`);
      } else {
        messageApi.error(
          `${banStatus ? "Cấm" : "Bỏ cấm"} user thất bại. Vui lòng thử lại.`,
        );
      }
    } catch (error) {
      console.error("Lỗi khi cấm/bỏ cấm user:", error);
      messageApi.error("Đã có lỗi xảy ra khi xử lý user");
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
      title: "Trạng thái Cấm",
      dataIndex: "ban",
      key: "ban",
      width: 120,
      filters: [
        { text: "Đang Cấm", value: 1 }, // Lọc theo giá trị số
        { text: "Không Cấm", value: 0 },
      ],
      onFilter: (value, record) => record.ban === value,
      render: (
        ban: number, // Render giá trị số từ DB
      ) => (
        <Tag color={ban === 1 ? "red" : "green"}>
          {ban === 1 ? "Đang Cấm" : "Bình thường"}
        </Tag>
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
            title={record.ban === 1 ? "Bỏ cấm người dùng" : "Cấm người dùng"}
            description={`Bạn có chắc chắn muốn ${record.ban === 1 ? "bỏ cấm" : "cấm"} user "${record.username}" này?`}
            onConfirm={() => handleBanUser(record.id, !(record.ban === 1))} // Chuyển đổi 0/1 sang boolean để truyền cho handleBanUser
            okText={record.ban === 1 ? "Bỏ cấm" : "Cấm"}
            cancelText="Hủy"
            okType={record.ban === 1 ? "default" : "danger"}
          >
            <Button
              danger={record.ban !== 1}
              type={record.ban === 1 ? "default" : "primary"}
              size="small"
              icon={<StopOutlined />}
            >
              {record.ban === 1 ? "Bỏ Cấm" : "Cấm"}
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

  const totalUsers = users.length;
  const adminUsers = users.filter((user) => user.is_admin).length;
  const bannedUsers = users.filter((user) => user.ban === 1).length; // Thống kê dựa trên giá trị số
  const totalCoins = users.reduce((sum, user) => sum + (user.coin || 0), 0);

  return (
    <div style={{ padding: "24px" }}>
      {contextHolder}

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
                  title="Đang Cấm"
                  value={bannedUsers}
                  valueStyle={{ color: "#fa541c" }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Tổng Coin"
                  value={totalCoins}
                  valueStyle={{ color: "#faad14" }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

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
              // Khi đọc từ Prisma (có thể là number 0/1) sang form (boolean), cần chuyển đổi
              ban: selectedUser.ban === 1 ? true : false, // Đã chuyển đổi
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

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Trạng thái Cấm"
                  name="ban"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="Đang Cấm"
                    unCheckedChildren="Bình thường"
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
