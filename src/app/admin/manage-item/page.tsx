"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Select,
} from "antd";
import {
  EditOutlined,
  SearchOutlined,
  TagsOutlined,
  DotChartOutlined,
  UserOutlined,
  SwapOutlined,
  ThunderboltOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { apiItems } from "@/app/handler/apiItems";
import type { ColumnsType } from "antd/es/table";
import { Prisma, type_item } from "@/generated/prisma";
import debounce from "lodash/debounce";
import { GenderType } from "@/app/common/constant";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

export type ItemTemplate = Prisma.item_templateGetPayload<{}>;

interface EditItemFormValues {
  NAME: string;
  description?: string;
  TYPE?: number;
  gender?: number;
  is_up_to_up?: boolean;
  power_require?: number;
  gold?: number;
  gem?: number;
}

const ItemManagementPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<ItemTemplate | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [items, setItems] = useState<ItemTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [editForm] = Form.useForm<EditItemFormValues>();
  const [TypeItem, setTypeItem] = useState<type_item[]>([]);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiItems.getAll();
      setItems(response.payload?.data || []);
    } catch (error) {
      console.error("Error fetching items:", error);
      messageApi.error("Không thể tải danh sách vật phẩm!");
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  const fetchType = useCallback(async () => {
    try {
      // Giả định apiItems.getItemType() tồn tại và trả về danh sách type_item
      const response = await apiItems.getItemType();
      setTypeItem(response.payload?.data || []);
    } catch (error) {
      console.error("Error fetching item types:", error);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchType();
  }, [fetchItems, fetchType]);

  const debouncedSearch = useCallback(
    debounce((value: string) => setSearch(value), 300),
    [],
  );

  const filteredItems = items.filter(
    (item) =>
      item.NAME?.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toString().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEditClick = (item: ItemTemplate) => {
    setSelectedItem(item);
    editForm.setFieldsValue({
      NAME: item.NAME,
      description: item.description,
      TYPE: item.TYPE,
      gender: item.gender,
      is_up_to_up: item.is_up_to_up,
      power_require: item.power_require,
      gold: item.gold,
      gem: item.gem,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (values: EditItemFormValues) => {
    if (!selectedItem) return;

    try {
      setEditLoading(true);
      const response = await apiItems.update(selectedItem.id, values);
      if (response.payload?.data) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === selectedItem.id
              ? { ...item, ...response.payload.data }
              : item,
          ),
        );
        messageApi.success("Cập nhật vật phẩm thành công!");
      } else {
        messageApi.error("Cập nhật vật phẩm thất bại!");
      }
      setIsEditModalOpen(false);
      editForm.resetFields();
    } catch (error) {
      console.error("Error updating item:", error);
      messageApi.error("Không thể cập nhật vật phẩm!");
    } finally {
      setEditLoading(false);
    }
  };

  // Đã xóa hàm handleDeleteItem

  const getGenderTypeName = (gender: number | null | undefined) => {
    if (gender === null || gender === undefined) return "N/A";
    switch (gender) {
      case GenderType.Traidat:
        return "Trái Đất";
      case GenderType.Namec:
        return "Namec";
      case GenderType.Xayda:
        return "Xayda";
      default:
        return `Không xác định (${gender})`;
    }
  };

  const getItemTypeName = (typeId: number | null | undefined) => {
    if (typeId === null || typeId === undefined) return "N/A";
    const type = TypeItem.find((t) => t.id === typeId);
    return type?.NAME || `Không xác định (${typeId})`;
  };

  const columns: ColumnsType<ItemTemplate> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
      render: (id: number) => <Text code>{id}</Text>,
    },
    {
      title: "Tên Vật phẩm",
      dataIndex: "NAME",
      key: "NAME",
      sorter: (a, b) => (a.NAME || "").localeCompare(b.NAME || ""),
      render: (name: string) => (
        <Space>
          <TagsOutlined />
          <Text strong copyable>
            {name || "N/A"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (desc: string) => (
        <Text type="secondary">{desc || "Không có"}</Text>
      ),
    },
    {
      title: "Loại (TYPE)",
      dataIndex: "TYPE",
      key: "TYPE",
      width: 150,
      sorter: (a, b) => (a.TYPE || 0) - (b.TYPE || 0),
      render: (type: number) => (
        <Tag color="blue" icon={<DotChartOutlined />}>
          {getItemTypeName(type)}
        </Tag>
      ),
    },
    {
      title: "Giới tính (Gender)",
      dataIndex: "gender",
      key: "gender",
      width: 150,
      sorter: (a, b) => (a.gender || 0) - (b.gender || 0),
      render: (gender: number) => {
        return (
          <Tag color="purple" icon={<UserOutlined />}>
            {getGenderTypeName(gender)}
          </Tag>
        );
      },
    },
    {
      title: "Xếp chồng (Up-to-up)",
      dataIndex: "is_up_to_up",
      key: "is_up_to_up",
      width: 120,
      render: (isUpToUp: boolean) => (
        <Tag color={isUpToUp ? "green" : "red"} icon={<SwapOutlined />}>
          {isUpToUp ? "Có" : "Không"}
        </Tag>
      ),
    },
    {
      title: "Yêu cầu Sức mạnh",
      dataIndex: "power_require",
      key: "power_require",
      width: 150,
      sorter: (a, b) => (a.power_require || 0) - (b.power_require || 0),
      render: (power: number) => (
        <Tag color="volcano" icon={<ThunderboltOutlined />}>
          {power ?? 0}
        </Tag>
      ),
    },
    {
      title: "Vàng (Gold)",
      dataIndex: "gold",
      key: "gold",
      width: 100,
      sorter: (a, b) => (a.gold || 0) - (b.gold || 0),
      render: (gold: number) => (
        <Tag color="gold" icon={<DollarOutlined />}>
          {gold ?? 0}
        </Tag>
      ),
    },
    {
      title: "Đá quý (Gem)",
      dataIndex: "gem",
      key: "gem",
      width: 100,
      sorter: (a, b) => (a.gem || 0) - (b.gem || 0),
      render: (gem: number) => (
        <Tag color="cyan" icon={<DollarOutlined />}>
          {gem ?? 0}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
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
          {/* Nút Xóa đã được gỡ bỏ */}
        </Space>
      ),
    },
  ];

  const totalItems = items.length;
  const itemsWithGold = items.filter((item) => (item.gold || 0) > 0).length;
  const itemsWithGem = items.filter((item) => (item.gem || 0) > 0).length;
  const upToUpItems = items.filter((item) => item.is_up_to_up).length;

  return (
    <div style={{ padding: 24, background: "#f0f2f5" }}>
      {contextHolder}
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} lg={12}>
              <Space align="center">
                <TagsOutlined style={{ fontSize: 32, color: "#1890ff" }} />
                <div>
                  <Title level={3} style={{ margin: 0 }}>
                    Quản lý Vật phẩm
                  </Title>
                  <Text type="secondary">
                    Quản lý các vật phẩm trong game/hệ thống
                  </Text>
                </div>
              </Space>
            </Col>
            <Col xs={24} lg={12}>
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Tổng Vật phẩm"
                    value={totalItems}
                    prefix={<TagsOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Có Vàng"
                    value={itemsWithGold}
                    valueStyle={{ color: "#b8900d" }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Có Đá quý"
                    value={itemsWithGem}
                    valueStyle={{ color: "#13c2c2" }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Có thể xếp chồng"
                    value={upToUpItems}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>

        <Card>
          <Row gutter={[16, 16]} justify="space-between" align="middle">
            <Col xs={24} sm={12} md={8} lg={6}>
              <Search
                placeholder="Tìm kiếm theo ID, tên hoặc mô tả..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onChange={(e) => debouncedSearch(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} style={{ textAlign: "right" }}>
              {/* Nút "Tạo Vật phẩm Mới" đã được gỡ bỏ */}
            </Col>
          </Row>

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
                `${range[0]} - ${range[1]} của ${total} vật phẩm`,
              pageSizeOptions: ["10", "20", "50"],
            }}
            scroll={{ x: 1300 }}
            size="middle"
            bordered
            locale={{
              emptyText: loading ? (
                <Spin tip="Đang tải dữ liệu..." />
              ) : (
                <Space
                  direction="vertical"
                  align="center"
                  style={{ padding: "50px 0" }}
                >
                  <TagsOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
                  <Text type="secondary">Không tìm thấy vật phẩm nào</Text>
                </Space>
              ),
            }}
          />
        </Card>

        <Modal
          title={
            <Space>
              <EditOutlined />
              Chỉnh sửa Vật phẩm
            </Space>
          }
          open={isEditModalOpen}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedItem(null);
            editForm.resetFields();
          }}
          footer={null}
          width={700}
        >
          <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Tên Vật phẩm"
                  name="NAME"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên vật phẩm!" },
                    {
                      min: 2,
                      message: "Tên vật phẩm phải có ít nhất 2 ký tự!",
                    },
                  ]}
                >
                  <Input
                    prefix={<TagsOutlined />}
                    placeholder="Nhập tên vật phẩm"
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Mô tả" name="description">
                  <Input.TextArea
                    rows={3}
                    placeholder="Nhập mô tả vật phẩm (tùy chọn)"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Loại (TYPE)"
                  name="TYPE"
                  rules={[
                    { required: true, message: "Vui lòng chọn loại vật phẩm!" },
                  ]}
                >
                  <Select
                    showSearch
                    placeholder="Chọn loại vật phẩm"
                    optionFilterProp="children"
                    filterOption={(input, option) => {
                      const childrenText = String(option?.children || "");
                      return childrenText
                        .toLowerCase()
                        .includes(input.toLowerCase());
                    }}
                  >
                    {TypeItem.map((type) => (
                      <Option key={type.id} value={type.id}>
                        {type.id} - {type.NAME}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Giới tính (Gender)"
                  name="gender"
                  rules={[
                    { required: true, message: "Vui lòng chọn giới tính!" },
                  ]}
                >
                  <Select
                    placeholder="Chọn giới tính"
                    style={{ width: "100%" }}
                    allowClear
                  >
                    {Object.values(GenderType)
                      .filter((value) => typeof value === "number")
                      .map((value) => (
                        <Option key={value as number} value={value as number}>
                          {getGenderTypeName(value as number)}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Yêu cầu Sức mạnh"
                  name="power_require"
                  rules={[
                    { type: "number", message: "Vui lòng nhập số!" },
                    {
                      min: 0,
                      message: "Yêu cầu sức mạnh phải là số không âm!",
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="Nhập yêu cầu sức mạnh"
                    min={0}
                    precision={0}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Có thể xếp chồng (is_up_to_up)"
                  name="is_up_to_up"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Có" unCheckedChildren="Không" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Vàng (Gold)"
                  name="gold"
                  rules={[
                    { type: "number", message: "Vui lòng nhập số!" },
                    { min: 0, message: "Vàng phải là số không âm!" },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="Nhập giá vàng"
                    min={0}
                    precision={0}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Đá quý (Gem)"
                  name="gem"
                  rules={[
                    { type: "number", message: "Vui lòng nhập số!" },
                    { min: 0, message: "Đá quý phải là số không âm!" },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="Nhập giá đá quý"
                    min={0}
                    precision={0}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
              <Space>
                <Button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedItem(null);
                    editForm.resetFields();
                  }}
                >
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit" loading={editLoading}>
                  {editLoading ? "Đang cập nhật..." : "Cập nhật"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Space>
    </div>
  );
};

export default ItemManagementPage;
