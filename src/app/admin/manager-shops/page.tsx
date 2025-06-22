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
  Form,
  InputNumber,
  Switch,
  Select,
} from "antd";
import {
  EditOutlined,
  ShopOutlined,
  DeleteOutlined,
  SearchOutlined,
  ShoppingOutlined,
  SettingOutlined,
  PictureOutlined,
  PlusCircleOutlined, // Import icon mới cho tạo mới
} from "@ant-design/icons";
import { item_shop, item_template, tab_shop } from "@/generated/prisma"; // Thêm tab_shop vào đây
import type { ColumnsType } from "antd/es/table";
import { apiShopItems } from "@/app/handler/apiShopItems";
import { useRouter } from "next/navigation";
import { apiItems } from "@/app/handler/apiItems";
import { GiftcodeItemType } from "@/app/common/constant";
import { getGiftcodeItemTypeName } from "./components/getGiftcodeItemTypeName";
import LinkPath from "@/app/common/link";
import { apiTabs } from "@/app/handler/apiTab";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function ShopManagementPage() {
  const [tabs, setTabs] = useState<tab_shop[]>([]); // Đổi tên state Tabs thành tabs (lowercase) cho consistent
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<item_shop | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // State cho modal tạo mới
  const [shopItems, setShopItems] = useState<item_shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false); // Loading state cho tạo mới
  const [messageApi, contextHolder] = message.useMessage();
  const [items, setItems] = useState<item_template[]>([]); // Danh sách item_template có sẵn
  const [editForm] = Form.useForm(); // Đổi tên form thành editForm cho rõ ràng
  const [createForm] = Form.useForm(); // Form cho chức năng tạo mới
  const router = useRouter();

  useEffect(() => {
    fetchShopItems();
    fetchItems();
    fetchTabs();
  }, []);

  const fetchTabs = async () => {
    const response = await apiTabs.getAll();
    if (response.payload) {
      setTabs(response.payload.data);
    } else {
      messageApi.error("Không thể tải danh sách Tabs!");
    }
  };

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

  const fetchItems = async () => {
    try {
      const response = await apiItems.getAll();
      if (response.payload) {
        setItems(response.payload.data);
      }
    } catch (error) {
      console.error("Lỗi khi fetch item templates:", error);
      messageApi.error("Không thể tải danh sách item templates");
    }
  };

  const debouncedSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const filteredItems = shopItems.filter(
    (item) =>
      item.id?.toString().includes(search.toLowerCase()) ||
      item.temp_id?.toString().includes(search.toLowerCase()) ||
      items
        .find((temp) => temp.id === item.temp_id)
        ?.NAME.toLowerCase()
        .includes(search.toLowerCase()),
  );

  // Giao diện dữ liệu cho Form tạo và sửa
  interface ItemFormValues {
    temp_id: number;
    tab_id: number; // Thêm tab_id vào đây
    is_new?: boolean;
    is_sell?: boolean;
    type_sell?: number;
    cost?: number;
    icon_spec?: number;
  }

  // --- Handle Sửa Item ---
  const handleEditClick = (item: item_shop) => {
    setSelectedItem(item);
    editForm.setFieldsValue({
      temp_id: item.temp_id,
      tab_id: item.tab_id, // Gán tab_id vào form
      is_new: item.is_new,
      is_sell: item.is_sell,
      type_sell: item.type_sell,
      cost: item.cost,
      icon_spec: item.icon_spec,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (values: ItemFormValues) => {
    if (!selectedItem) return;
    try {
      setEditLoading(true);
      const response = await apiShopItems.update(selectedItem.id, values);
      if (response.status === 200) {
        fetchShopItems();
        messageApi.success("Cập nhật shop item thành công! ✨"); // Thêm emoji cho vui
        setIsEditModalOpen(false);
        setSelectedItem(null);
        editForm.resetFields();
      } else {
        messageApi.error("Cập nhật shop item thất bại. Vui lòng thử lại. 😅");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật shop item:", error);
      messageApi.error("Không thể cập nhật shop item");
    } finally {
      setEditLoading(false);
    }
  };
  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
    createForm.resetFields();
  };

  const handleCreateSubmit = async (values: ItemFormValues) => {
    try {
      setCreateLoading(true);
      const response = await apiShopItems.createItemsShop(values);
      if (response) {
        fetchShopItems();
        messageApi.success("Tạo shop item mới thành công! 🎉");
        setIsCreateModalOpen(false);
        createForm.resetFields();
      } else {
        messageApi.error("Tạo shop item thất bại. Vui lòng thử lại. 🧐");
      }
    } catch (error) {
      console.error("Lỗi khi tạo shop item:", error);
      messageApi.error("Không thể tạo shop item mới");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      const response = await apiShopItems.delete(itemId);
      if (response.status === 200) {
        fetchShopItems();
        messageApi.success("Xóa shop item thành công! Gút chóp! 👍");
      } else {
        messageApi.error("Xóa shop item thất bại. Vui lòng thử lại. 💔");
      }
    } catch (error) {
      console.error("Lỗi khi xóa shop item:", error);
      messageApi.error("Đã có lỗi xảy ra khi xóa shop item");
    }
  };

  const handleEditOptionsClick = (itemId: number) => {
    router.push(`${LinkPath.manager_shop}/options/${itemId}`);
  };

  // --- Cấu hình cột Table ---
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
      title: "Tab Shop", // Đổi tiêu đề rõ hơn
      dataIndex: "tab_id",
      key: "tab_id",
      width: 150, // Tăng width một chút cho tên tab dài
      render: (tabId: number) => {
        // Tìm tab trong mảng `tabs` (đã đổi tên thành lowercase)
        const tab = tabs.find((t) => t.id === tabId);
        return <Text strong>{tab ? tab.NAME : `ID: ${tabId} (Không rõ)`}</Text>;
      },
    },
    {
      title: "Tên Item",
      key: "item_name",
      width: 200,
      render: (_, record) => {
        const itemTemplate = items.find((item) => item.id === record.temp_id);
        return itemTemplate?.NAME || "Không rõ";
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Tag color={record.is_new ? "green" : "default"}>
            {record.is_new ? "Mới" : "Cũ"} {/* Mới (New) / Cũ (Old) */}
          </Tag>
          <Tag color={record.is_sell ? "blue" : "red"}>
            {record.is_sell ? "Đang bán" : "Ngừng bán"}{" "}
            {/* Đang bán (Selling) / Ngừng bán (Stopped Selling) */}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Loại bán",
      dataIndex: "type_sell",
      key: "type_sell",
      width: 150,
      render: (typeSell: number | null) => (
        <Text>{getGiftcodeItemTypeName(typeSell)}</Text>
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
          {cost !== null ? cost.toLocaleString() : "Miễn phí"}{" "}
          {/* Miễn phí (Free) */}
        </Text>
      ),
    },
    {
      title: "Vật Phẩm",
      dataIndex: "icon_spec",
      key: "icon_spec",
      width: 150,
      render: (iconSpec: number | null) => {
        const iconItemTemplate = items.find(
          (item) => item.icon_id === iconSpec,
        );
        return (
          iconItemTemplate?.NAME ||
          (iconSpec !== null ? `Icon ID: ${iconSpec}` : "N/A")
        );
      },
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

  const totalItems = shopItems.length;
  const newItems = shopItems.filter((item) => item.is_new).length;
  const sellingItems = shopItems.filter((item) => item.is_sell).length;

  return (
    <div style={{ padding: "24px" }}>
      {contextHolder}

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
                <Text type="secondary">
                  Quản lý các `item` trong `shop game` của bạn, dễ như ăn kẹo!
                  🍬
                </Text>
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

      <Card>
        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Search
            placeholder="Tìm kiếm theo ID hoặc Template ID..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={search}
            onChange={(e) => debouncedSearch(e.target.value)}
            style={{ maxWidth: "400px" }}
          />
          <Button
            type="primary"
            size="large"
            icon={<PlusCircleOutlined />}
            onClick={handleCreateClick}
          >
            Thêm Shop Item mới
          </Button>
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

      {/* Modal Chỉnh sửa Shop Item */}
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
          editForm.resetFields(); // Reset editForm
        }}
        footer={null}
        width={700}
      >
        {selectedItem && (
          <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Template ID"
                  name="temp_id"
                  rules={[
                    { required: true, message: "Vui lòng chọn Template ID!" },
                  ]}
                >
                  <Select
                    showSearch
                    placeholder="Chọn Template ID"
                    optionFilterProp="children"
                    filterOption={(input, option) => {
                      const childrenText = String(option?.children || "");
                      return childrenText
                        .toLowerCase()
                        .includes(input.toLowerCase());
                    }}
                  >
                    {items.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.id} - {item.NAME}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Tab Shop"
                  name="tab_id"
                  rules={[{ required: true, message: "Vui lòng chọn Tab!" }]}
                >
                  <Select
                    showSearch
                    placeholder="Chọn Tab Shop"
                    optionFilterProp="children"
                    filterOption={(input, option) => {
                      const childrenText = String(option?.children || "");
                      return childrenText
                        .toLowerCase()
                        .includes(input.toLowerCase());
                    }}
                  >
                    {tabs.map((tab) => (
                      <Option key={tab.id} value={tab.id}>
                        {tab.id} - {tab.NAME}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
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
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Item mới"
                  name="is_new"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="Mới"
                    unCheckedChildren="Cũ"
                    className="small-switch"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Đang bán"
                  name="is_sell"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="Bán"
                    unCheckedChildren="Ngừng"
                    className="small-switch"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Loại bán" name="type_sell">
                  <Select
                    placeholder="Chọn loại bán"
                    style={{ width: "100%" }}
                    allowClear
                  >
                    {Object.values(GiftcodeItemType)
                      .filter((value) => typeof value === "number")
                      .map((value) => (
                        <Option key={value as number} value={value as number}>
                          {getGiftcodeItemTypeName(value as number)}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="Icon Spec" name="icon_spec">
                  <Select
                    showSearch
                    placeholder="Chọn Item để lấy Icon"
                    optionFilterProp="children"
                    filterOption={(input, option) => {
                      const lowerCaseInput = input.toLowerCase();
                      const currentItemTemplate = items.find(
                        (temp) => temp.icon_id === option?.value,
                      );

                      if (!currentItemTemplate) {
                        return false;
                      }
                      const searchableText =
                        `${currentItemTemplate.id} ${currentItemTemplate.icon_id} ${currentItemTemplate.NAME}`.toLowerCase();
                      return searchableText.includes(lowerCaseInput);
                    }}
                    allowClear
                  >
                    {items.map((item) => (
                      <Select.Option key={item.id} value={item.icon_id}>
                        <Space>
                          <PictureOutlined /> {item.id} - {item.NAME}
                        </Space>
                      </Select.Option>
                    ))}
                  </Select>
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

      {/* Modal Tạo Mới Shop Item */}
      <Modal
        title={
          <Space>
            <PlusCircleOutlined />
            Tạo Shop Item mới
          </Space>
        }
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          createForm.resetFields(); // Reset createForm
        }}
        footer={null}
        width={700}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateSubmit}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Template ID"
                name="temp_id"
                rules={[
                  { required: true, message: "Vui lòng chọn Template ID!" },
                ]}
              >
                <Select
                  showSearch
                  placeholder="Chọn Template ID"
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    const childrenText = String(option?.children || "");
                    return childrenText
                      .toLowerCase()
                      .includes(input.toLowerCase());
                  }}
                >
                  {items.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.id} - {item.NAME}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tab Shop"
                name="tab_id"
                rules={[{ required: true, message: "Vui lòng chọn Tab!" }]}
              >
                <Select
                  showSearch
                  placeholder="Chọn Tab Shop"
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    const childrenText = String(option?.children || "");
                    return childrenText
                      .toLowerCase()
                      .includes(input.toLowerCase());
                  }}
                >
                  {tabs.map((tab) => (
                    <Option key={tab.id} value={tab.id}>
                      {tab.id} - {tab.NAME}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
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
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Item mới"
                name="is_new"
                valuePropName="checked"
                initialValue={false} // Mặc định là false khi tạo mới
              >
                <Switch
                  checkedChildren="Mới"
                  unCheckedChildren="Cũ"
                  className="small-switch"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Đang bán"
                name="is_sell"
                valuePropName="checked"
                initialValue={true} // Mặc định là true khi tạo mới
              >
                <Switch
                  checkedChildren="Bán"
                  unCheckedChildren="Ngừng"
                  className="small-switch"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Loại bán" name="type_sell">
                <Select
                  placeholder="Chọn loại bán"
                  style={{ width: "100%" }}
                  allowClear
                >
                  {Object.values(GiftcodeItemType)
                    .filter((value) => typeof value === "number")
                    .map((value) => (
                      <Option key={value as number} value={value as number}>
                        {getGiftcodeItemTypeName(value as number)}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Icon Spec" name="icon_spec">
                <Select
                  showSearch
                  placeholder="Chọn Item để lấy Icon"
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    const lowerCaseInput = input.toLowerCase();
                    const currentItemTemplate = items.find(
                      (temp) => temp.icon_id === option?.value,
                    );

                    if (!currentItemTemplate) {
                      return false;
                    }
                    const searchableText =
                      `${currentItemTemplate.id} ${currentItemTemplate.icon_id} ${currentItemTemplate.NAME}`.toLowerCase();
                    return searchableText.includes(lowerCaseInput);
                  }}
                  allowClear
                >
                  {items.map((item) => (
                    <Select.Option key={item.id} value={item.icon_id}>
                      <Space>
                        <PictureOutlined /> {item.id} - {item.NAME}
                      </Space>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  createForm.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createLoading}
                icon={<PlusCircleOutlined />}
              >
                {createLoading ? "Đang tạo..." : "Tạo mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
