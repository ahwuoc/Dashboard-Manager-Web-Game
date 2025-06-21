"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Form,
  InputNumber,
  Switch,
} from "antd";
import {
  EditOutlined,
  UserOutlined,
  GiftOutlined,
  TeamOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { apiUser } from "@/app/handler/apiUsers";
import { account } from "@/generated/prisma";
import Link from "next/link";
import type { ColumnsType } from "antd/es/table";
import LinkPath from "@/app/common/link";

// Custom hook để "debounce" - trì hoãn việc thực thi một hàm
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

const { Title, Text } = Typography;
const { Search } = Input;

// Interface cho các giá trị trong form chỉnh sửa
interface EditUserFormValues {
  username: string;
  coin?: number;
  tongnap?: number;
  is_admin?: boolean;
  ban?: boolean;
  active?: boolean; // THÊM CHO 'ACTIVE'
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<account[]>([]);
  const [loading, setLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<account | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<EditUserFormValues>();
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await apiUser.getAll();
        if (response.payload?.data) {
          const usersWithDefaults = response.payload.data.map((u) => ({
            ...u,
            active: u.active ?? 1,
          }));
          setUsers(usersWithDefaults);
        } else {
          messageApi.error("Không thể tải danh sách người dùng");
        }
      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu user:", error);
        messageApi.error("Không thể tải danh sách người dùng");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [messageApi]);

  const filteredUsers = useMemo(() => {
    if (!debouncedSearchTerm) return users;
    return users.filter(
      (user) =>
        user.username
          ?.toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        user.id?.toString().includes(debouncedSearchTerm.toLowerCase()),
    );
  }, [users, debouncedSearchTerm]);

  const handleEditClick = (user: account) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
  };

  const handleEditSubmit = async (values: EditUserFormValues) => {
    if (!selectedUser) return;
    setEditLoading(true);
    try {
      const dataToSend = {
        ...values,
        ban: values.ban ? 1 : 0,
        active: values.active ? 1 : 0, // THÊM CHO 'ACTIVE': Convert boolean sang number
      };

      const response = await apiUser.update(selectedUser.id, dataToSend);

      if (response.payload?.data) {
        const updatedUser = response.payload.data;
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === updatedUser.id ? updatedUser : user,
          ),
        );
        messageApi.success("Cập nhật thông tin user thành công!");
        handleModalClose();
      } else {
        messageApi.error("Cập nhật thông tin user thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật user:", error);
      messageApi.error("Đã có lỗi xảy ra khi cập nhật user");
    } finally {
      setEditLoading(false);
    }
  };

  const handleBanUser = async (userId: number, banStatus: boolean) => {
    try {
      const statusToSend = banStatus ? 1 : 0;
      const response = await apiUser.update(userId, { ban: statusToSend });
      if (response.payload?.data) {
        const updatedUser = response.payload.data;
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === updatedUser.id ? updatedUser : user,
          ),
        );
        messageApi.success(`${banStatus ? "Cấm" : "Bỏ cấm"} user thành công!`);
      } else {
        messageApi.error(`${banStatus ? "Cấm" : "Bỏ cấm"} user thất bại.`);
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
      width: 100,
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
    // THÊM CHO 'ACTIVE': Thêm cột mới để hiển thị trạng thái active
    {
      title: "Kích hoạt",
      dataIndex: "active",
      key: "active",
      width: 120,
      filters: [
        { text: "Đã Kích Hoạt", value: 1 },
        { text: "Chưa Kích Hoạt", value: 0 },
      ],
      onFilter: (value, record) => record.active === value,
      render: (active: number) => (
        <Tag
          icon={<CheckCircleOutlined />}
          color={active === 1 ? "success" : "default"}
        >
          {active === 1 ? "Đã Kích Hoạt" : "Chưa"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái Cấm",
      dataIndex: "ban",
      key: "ban",
      width: 130,
      filters: [
        { text: "Đang Cấm", value: 1 },
        { text: "Bình thường", value: 0 },
      ],
      onFilter: (value, record) => record.ban === value,
      render: (ban: number) => (
        <Tag icon={<StopOutlined />} color={ban === 1 ? "volcano" : "green"}>
          {ban === 1 ? "Đang Cấm" : "Bình thường"}
        </Tag>
      ),
    },
    {
      title: "Coin",
      dataIndex: "coin",
      key: "coin",
      width: 100,
      sorter: (a, b) => (a.coin || 0) - (b.coin || 0),
      render: (coin: number) => (
        <Text strong style={{ color: "#faad14" }}>
          {(coin || 0).toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 200,
      fixed: "right",
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
            title={record.ban === 1 ? "Bỏ cấm người dùng?" : "Cấm người dùng?"}
            description={`Bạn chắc chắn muốn ${record.ban === 1 ? "bỏ cấm" : "cấm"} user "${record.username}"?`}
            onConfirm={() => handleBanUser(record.id, !(record.ban === 1))}
            okText="Xác nhận"
            cancelText="Hủy"
            okButtonProps={{ danger: record.ban !== 1 }}
          >
            <Button
              danger={record.ban !== 1}
              size="small"
              icon={<StopOutlined />}
            >
              {record.ban === 1 ? "Bỏ Cấm" : "Cấm"}
            </Button>
          </Popconfirm>
          <Link href={`${LinkPath.manager_user}/gift?id=${record.id}`}>
            <Button
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
  const bannedUsers = users.filter((user) => user.ban === 1).length;
  const activeUsers = users.filter((user) => user.active === 1).length; // THÊM CHO 'ACTIVE': Thống kê user đã active

  return (
    <div style={{ padding: "24px" }}>
      {contextHolder}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={24} md={8}>
            <Space align="center">
              <TeamOutlined style={{ fontSize: "32px", color: "#1890ff" }} />
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  Quản lý User
                </Title>
                <Text type="secondary">Tổng quan và quản lý người dùng</Text>
              </div>
            </Space>
          </Col>
          <Col xs={24} sm={24} md={16}>
            <Row gutter={[16, 16]}>
              <Col flex="1">
                <Statistic
                  title="Tổng Users"
                  value={totalUsers}
                  prefix={<UserOutlined />}
                />
              </Col>
              {/* THÊM CHO 'ACTIVE': Thêm thống kê và điều chỉnh layout */}
              <Col flex="1">
                <Statistic
                  title="Kích hoạt"
                  value={activeUsers}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
              <Col flex="1">
                <Statistic
                  title="Admin"
                  value={adminUsers}
                  valueStyle={{ color: "#f5222d" }}
                />
              </Col>
              <Col flex="1">
                <Statistic
                  title="Đang Cấm"
                  value={bannedUsers}
                  valueStyle={{ color: "#fa541c" }}
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
            enterButton
            size="large"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} mục`,
          }}
          scroll={{ x: 1200 }}
          size="middle"
          bordered
        />
      </Card>

      {selectedUser && (
        <Modal
          title={
            <Space>
              <EditOutlined />
              Chỉnh sửa User: <Text code>{selectedUser.username}</Text>
            </Space>
          }
          open={isEditModalOpen}
          onCancel={handleModalClose}
          footer={null}
          width={600}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleEditSubmit}
            initialValues={{
              ...selectedUser,
              ban: selectedUser.ban === 1,
              active: selectedUser.active === 1, // THÊM CHO 'ACTIVE': Set giá trị ban đầu cho Switch
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Tên người dùng"
                  name="username"
                  rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
                >
                  <Input prefix={<UserOutlined />} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Tổng nạp" name="tongnap">
                  <InputNumber
                    style={{ width: "100%" }}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Coin" name="coin">
                  <InputNumber
                    style={{ width: "100%" }}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                {/* THÊM CHO 'ACTIVE': Di chuyển switch vào đây */}
                <Form.Item
                  label="Trạng thái Kích hoạt"
                  name="active"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="Đã Kích Hoạt"
                    unCheckedChildren="Chưa Kích Hoạt"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Quyền Admin"
                  name="is_admin"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Admin" unCheckedChildren="User" />
                </Form.Item>
              </Col>
              <Col span={12}>
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
                <Button onClick={handleModalClose}>Hủy</Button>
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
        </Modal>
      )}
    </div>
  );
}
