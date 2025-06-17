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
  Form,
  InputNumber,
  Switch,
} from "antd";
import {
  EditOutlined,
  ShopOutlined,
  DeleteOutlined,
  SearchOutlined,
  ShoppingOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { item_shop, item_template } from "@/generated/prisma";
import type { ColumnsType } from "antd/es/table";
import { apiShopItems } from "@/app/handler/apiShopItems";
import { useRouter } from "next/navigation";
const { Title, Text } = Typography;
const { Search } = Input;
export default function ShopManagementPage() {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<item_shop | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [shopItems, setShopItems] = useState<item_shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    fetchShopItems();
  }, []);

  const fetchShopItems = async () => {
    try {
      setLoading(true);
      const response = await apiShopItems.getAll();
      if (response.payload) {
        setShopItems(response.payload.data);
      }
    } catch (error) {
      console.error("Lỗi khi fetch dữ liệu shop items:", error);
      messageApi.error("Không thể tải danh sách shop items");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = shopItems.filter(
    (item) =>
      item.id?.toString().includes(search.toLowerCase()) ||
      item.temp_id?.toString().includes(search.toLowerCase()),
  );

  const handleEditClick = (item: item_shop) => {
    setSelectedItem(item);
    form.setFieldsValue({
      temp_id: item.temp_id,
      is_new: item.is_new,
      is_sell: item.is_sell,
      type_sell: item.type_sell,
      cost: item.cost,
      icon_spec: item.icon_spec,
    });
    setIsEditModalOpen(true);
  };

  const handleEditOptionsClick = (itemId: number) => {
    router.push(`/admin/manage-shop/options/${itemId}`);
  };

  const handleEditSubmit = async (values: item_template) => {
    if (!selectedItem) return;
    try {
      setEditLoading(true);
      const updatedData = {
        ...values,
      };
      setShopItems(
        shopItems.map((item) =>
          item.id === selectedItem.id ? { ...item, ...updatedData } : item,
        ),
      );
      const response = await apiShopItems.update(selectedItem.id, updatedData);
      if (response.status === 200) {
        messageApi.success("Cập nhật shop item thành công!");
        setIsEditModalOpen(false);
        setSelectedItem(null);
        form.resetFields();
      } else {
        messageApi.error("Cập nhật shop item thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật shop item:", error);
      messageApi.error("Không thể cập nhật shop item");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      const response = await apiShopItems.delete(itemId);
      if (response.status === 200) {
        setShopItems(shopItems.filter((item) => item.id !== itemId));
        messageApi.success("Xóa shop item thành công!");
      } else {
        messageApi.error("Xóa shop item thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi xóa shop item:", error);
      messageApi.error("Đã có lỗi xảy ra khi xóa shop item");
    }
  };

  const columns: ColumnsType<item_shop> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
      render: (id: number) => <Text code>{id}</Text>,
    },
    {
      title: "Template ID",
      dataIndex: "temp_id",
      key: "temp_id",
      width: 120,
      sorter: (a, b) => a.temp_id - b.temp_id,
      render: (tempId: number) => <Text strong>{tempId}</Text>,
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Tag color={record.is_new ? "green" : "default"}>
            {record.is_new ? "Mới" : "Cũ"}
          </Tag>
          <Tag color={record.is_sell ? "blue" : "red"}>
            {record.is_sell ? "Đang bán" : "Ngừng bán"}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Loại bán",
      dataIndex: "type_sell",
      key: "type_sell",
      width: 100,
      render: (typeSell: number | null) => (
        <Text>{typeSell !== null ? typeSell : "N/A"}</Text>
      ),
    },
    {
      title: "Giá",
      dataIndex: "cost",
      key: "cost",
      width: 120,
      sorter: (a, b) => (a.cost || 0) - (b.cost || 0),
      render: (cost: number | null) => (
        <Text strong style={{ color: "#faad14" }}>
          {cost !== null ? cost.toLocaleString() : "Miễn phí"}
        </Text>
      ),
    },
    {
      title: "Icon Spec",
      dataIndex: "icon_spec",
      key: "icon_spec",
      width: 100,
      render: (iconSpec: number | null) => (
        <Text>{iconSpec !== null ? iconSpec : "N/A"}</Text>
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
          <Button
            type="default"
            size="small"
            icon={<SettingOutlined />}
            onClick={() => handleEditOptionsClick(record.id)}
            style={{
              backgroundColor: "#52c41a",
              borderColor: "#52c41a",
              color: "white",
            }}
          >
            Edit Options
          </Button>
          <Popconfirm
            title="Xóa shop item"
            description={`Bạn có chắc chắn muốn xóa item ID "${record.id}"?`}
            onConfirm={() => handleDeleteItem(record.id)}
            okText="Có"
            cancelText="Không"
            okType="danger"
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Tính toán thống kê
  const totalItems = shopItems.length;
  const newItems = shopItems.filter((item) => item.is_new).length;
  const sellingItems = shopItems.filter((item) => item.is_sell).length;

  return (
    <div style={{ padding: "24px" }}>
      {contextHolder}

      {/* Header với thống kê */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Space align="center">
              <ShoppingOutlined
                style={{ fontSize: "32px", color: "#1890ff" }}
              />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Quản lý Shop Items
                </Title>
                <Text type="secondary">Quản lý các item trong shop game</Text>
              </div>
            </Space>
          </Col>
          <Col span={12}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Tổng Items"
                  value={totalItems}
                  prefix={<ShopOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Items Mới"
                  value={newItems}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Đang Bán"
                  value={sellingItems}
                  valueStyle={{ color: "#faad14" }}
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
            placeholder="Tìm kiếm theo ID hoặc Template ID..."
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
          dataSource={filteredItems}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} shop items`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          scroll={{ x: 1000 }}
          size="middle"
          bordered
        />
      </Card>

      {/* Modal chỉnh sửa */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            Chỉnh sửa Shop Item
          </Space>
        }
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        {selectedItem && (
          <Form form={form} layout="vertical" onFinish={handleEditSubmit}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Template ID"
                  name="temp_id"
                  rules={[
                    { required: true, message: "Vui lòng nhập Template ID!" },
                  ]}
                >
                  <InputNumber style={{ width: "100%" }} min={0} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Item mới"
                  name="is_new"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Mới" unCheckedChildren="Cũ" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Đang bán"
                  name="is_sell"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Bán" unCheckedChildren="Ngừng" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Loại bán" name="type_sell">
                  <InputNumber style={{ width: "100%" }} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Giá" name="cost">
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Icon Spec" name="icon_spec">
                  <InputNumber style={{ width: "100%" }} min={0} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
              <Space>
                <Button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedItem(null);
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
