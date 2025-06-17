"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  Input,
  Button,
  Badge,
  Divider,
  Table,
  Select,
  Tabs,
  message,
  Space,
  Typography,
  Row,
  Col,
  Spin,
  Alert,
  Tag,
  InputNumber,
  Popconfirm,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  GiftOutlined,
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
  SaveOutlined,
  InboxOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { apiUser } from "@/app/handler/apiUsers";
import { apiItems } from "@/app/handler/apiItems";
import { apiOptions } from "@/app/handler/apiOptions";
import {
  account,
  item_option_template,
  item_template,
} from "@/generated/prisma";
import { apiGifts } from "@/app/handler/apiGifts";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// Interfaces giữ nguyên
interface OptionWithParam {
  optionId: number;
  optionName: string;
  paramValue: string;
}

interface SelectedItemWithOptions {
  itemId: number;
  itemName: string;
  selectedOptions: OptionWithParam[];
  quantity: number;
}

export default function GiftPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const [messageApi, contextHolder] = message.useMessage();

  const [user, setUser] = useState<account | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<item_template[]>([]);
  const [allOptions, setAllOptions] = useState<item_option_template[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState<item_template[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItemWithOptions[]>(
    [],
  );
  const [itemLoading, setItemLoading] = useState(false);
  const [localStorageItems, setLocalStorageItems] = useState<
    SelectedItemWithOptions[]
  >([]);

  // useEffect functions giữ nguyên logic
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [optionsResponse, itemsResponse, userResponse] =
          await Promise.all([
            apiOptions.getAll(),
            apiItems.getAll(),
            userId ? apiUser.getById(Number(userId)) : Promise.resolve(null),
          ]);

        if (optionsResponse.payload?.data) {
          setAllOptions(optionsResponse.payload.data);
        }

        if (itemsResponse.payload?.data) {
          setItems(itemsResponse.payload.data);
          setFilteredItems(itemsResponse.payload.data);
        }

        if (userId) {
          if (userResponse?.payload?.data) {
            setUser(userResponse.payload.data);
          } else {
            messageApi.error("Không tìm thấy thông tin user.");
          }
        }
      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu:", error);
        messageApi.error("Đã có lỗi xảy ra khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    if (!userId) {
      messageApi.error("Không tìm thấy ID user.");
      setLoading(false);
      return;
    }

    fetchData();
  }, [userId, messageApi]);

  useEffect(() => {
    const storedItems = localStorage.getItem("giftItems");
    if (storedItems) {
      setLocalStorageItems(JSON.parse(storedItems));
    }
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(
        (item) =>
          item.NAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.id.toString().includes(searchTerm),
      );
      setFilteredItems(filtered);
    }
  }, [searchTerm, items]);

  // Functions xử lý logic
  const addItemToSelected = (item: item_template) => {
    const existingIndex = selectedItems.findIndex(
      (selected) => selected.itemId === item.id,
    );

    if (existingIndex >= 0) {
      const updatedItems = [...selectedItems];
      updatedItems[existingIndex].quantity += 1;
      setSelectedItems(updatedItems);
      messageApi.success(
        `Đã tăng số lượng ${item.NAME} lên ${updatedItems[existingIndex].quantity}`,
      );
    } else {
      const newSelectedItem: SelectedItemWithOptions = {
        itemId: item.id,
        itemName: item.NAME || `Item ${item.id}`,
        selectedOptions: [],
        quantity: 1,
      };
      setSelectedItems([...selectedItems, newSelectedItem]);
      messageApi.success(`Đã thêm ${item.NAME} vào danh sách`);
    }
  };

  const removeSelectedItem = (index: number) => {
    const itemName = selectedItems[index].itemName;
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
    messageApi.success(`Đã xóa ${itemName} khỏi danh sách`);
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeSelectedItem(index);
      return;
    }

    const updatedItems = [...selectedItems];
    updatedItems[index].quantity = quantity;
    setSelectedItems(updatedItems);
  };

  const addOptionToItem = (itemIndex: number, optionId: number) => {
    if (!optionId) return;

    const updatedItems = [...selectedItems];
    const option = allOptions.find((opt) => opt.id === optionId);

    const optionExists = updatedItems[itemIndex].selectedOptions.some(
      (opt) => opt.optionId === optionId,
    );

    if (!optionExists && option) {
      updatedItems[itemIndex].selectedOptions.push({
        optionId,
        optionName: option.NAME || `Option ${optionId}`,
        paramValue: "",
      });
      setSelectedItems(updatedItems);
      messageApi.success(`Đã thêm option "${option.NAME}"`);
    } else if (optionExists) {
      messageApi.warning(`Option "${option?.NAME}" đã được thêm rồi!`);
    }
  };

  const removeOptionFromItem = (itemIndex: number, optionId: number) => {
    const updatedItems = [...selectedItems];
    const option = updatedItems[itemIndex].selectedOptions.find(
      (opt) => opt.optionId === optionId,
    );
    updatedItems[itemIndex].selectedOptions = updatedItems[
      itemIndex
    ].selectedOptions.filter((opt) => opt.optionId !== optionId);
    setSelectedItems(updatedItems);
    messageApi.success(`Đã xóa option "${option?.optionName}"`);
  };

  const updateOptionParam = (
    itemIndex: number,
    optionId: number,
    paramValue: string,
  ) => {
    const updatedItems = [...selectedItems];
    const optionIndex = updatedItems[itemIndex].selectedOptions.findIndex(
      (opt) => opt.optionId === optionId,
    );
    if (optionIndex >= 0) {
      updatedItems[itemIndex].selectedOptions[optionIndex].paramValue =
        paramValue;
      setSelectedItems(updatedItems);
    }
  };

  const handleAddToLocalStorage = () => {
    if (selectedItems.length === 0) {
      messageApi.error("Vui lòng chọn ít nhất một item để lưu.");
      return;
    }

    const updatedLocalStorageItems = [...localStorageItems, ...selectedItems];
    localStorage.setItem("giftItems", JSON.stringify(updatedLocalStorageItems));
    setLocalStorageItems(updatedLocalStorageItems);
    setSelectedItems([]);
    messageApi.success("Đã lưu items vào kho lưu trữ thành công!");
  };

  const removeFromLocalStorage = (index: number) => {
    const itemName = localStorageItems[index].itemName;
    const updatedLocalStorageItems = localStorageItems.filter(
      (_, i) => i !== index,
    );
    localStorage.setItem("giftItems", JSON.stringify(updatedLocalStorageItems));
    setLocalStorageItems(updatedLocalStorageItems);
    messageApi.success(`Đã xóa ${itemName} khỏi kho lưu trữ`);
  };

  const giftFromLocalStorage = async (index: number) => {
    if (!user || !user.id) {
      messageApi.error("Không tìm thấy thông tin user.");
      return;
    }

    const itemToGift = localStorageItems[index];
    try {
      setItemLoading(true);

      const body = {
        userId: user.id,
        itemId: itemToGift.itemId,
        quantity: itemToGift.quantity,
        options: itemToGift.selectedOptions.map((opt) => ({
          id: opt.optionId,
          param: opt.paramValue,
        })),
      };
      const response = await apiGifts.post(body);

      if (response.status === 200) {
        messageApi.success(
          `Đã tặng ${itemToGift.itemName} cho user ${user.username || "N/A"} thành công!`,
        );
        removeFromLocalStorage(index);
      } else {
        messageApi.error("Tặng item thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi tặng item từ localStorage:", error);
      messageApi.error("Đã có lỗi xảy ra khi tặng item. Vui lòng thử lại.");
    } finally {
      setItemLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/admin/user");
  };

  // Columns cho bảng danh sách items
  const itemColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (id: number) => <Text code>{id}</Text>,
    },
    {
      title: "Tên Item",
      dataIndex: "NAME",
      key: "NAME",
      render: (name: string, record: item_template) =>
        name || `Item ${record.id}`,
    },
    {
      title: "Hành động",
      key: "action",
      width: 100,
      render: (_: unknown, record: item_template) => (
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => addItemToSelected(record)}
        />
      ),
    },
  ];

  // Columns cho bảng kho lưu trữ
  const storageColumns = [
    {
      title: "ID",
      dataIndex: "itemId",
      key: "itemId",
      width: 80,
      render: (id: number) => <Text code>{id}</Text>,
    },
    {
      title: "Tên Item",
      dataIndex: "itemName",
      key: "itemName",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      render: (quantity: number) => <Badge count={quantity} showZero />,
    },
    {
      title: "Options",
      dataIndex: "selectedOptions",
      key: "selectedOptions",
      render: (options: OptionWithParam[]) => (
        <Space wrap>
          {options.length > 0 ? (
            options.map((opt, index) => (
              <Tag key={index} color="blue">
                {opt.optionName}
                {opt.paramValue && ` (${opt.paramValue})`}
              </Tag>
            ))
          ) : (
            <Text type="secondary">Không có option</Text>
          )}
        </Space>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      render: (_: unknown, record: unknown, index: number) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<GiftOutlined />}
            onClick={() => giftFromLocalStorage(index)}
            loading={itemLoading}
          />
          <Popconfirm
            title="Xóa item này?"
            description="Bạn có chắc chắn muốn xóa item này khỏi kho lưu trữ?"
            onConfirm={() => removeFromLocalStorage(index)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="default" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        padding: "24px",
      }}
    >
      {contextHolder}
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Header Card */}
          <Card
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              color: "white",
            }}
          >
            <Row justify="space-between" align="middle">
              <Col>
                <Space align="center">
                  <div
                    style={{
                      padding: "12px",
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <GiftOutlined
                      style={{ fontSize: "24px", color: "white" }}
                    />
                  </div>
                  <div>
                    <Title level={2} style={{ color: "white", margin: 0 }}>
                      Quản lý tặng Items
                    </Title>
                    <Text style={{ color: "rgba(255,255,255,0.8)" }}>
                      Tặng items và quản lý kho lưu trữ
                    </Text>
                  </div>
                </Space>
              </Col>
              <Col>
                <Button
                  type="default"
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBack}
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    borderColor: "rgba(255,255,255,0.3)",
                    color: "white",
                  }}
                >
                  Quay lại
                </Button>
              </Col>
            </Row>

            {/* User Info */}
            {user && (
              <div
                style={{
                  marginTop: "24px",
                  padding: "16px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Space align="center" style={{ marginBottom: "12px" }}>
                  <UserOutlined style={{ fontSize: "20px" }} />
                  <Title level={4} style={{ color: "white", margin: 0 }}>
                    Thông tin User
                  </Title>
                </Space>
                <Row gutter={24}>
                  <Col span={4}>
                    <Text style={{ color: "rgba(255,255,255,0.8)" }}>Tên</Text>
                    <div style={{ color: "white", fontWeight: "bold" }}>
                      {user.username || "N/A"}
                    </div>
                  </Col>
                  <Col span={4}>
                    <Text style={{ color: "rgba(255,255,255,0.8)" }}>ID</Text>
                    <div style={{ color: "white", fontWeight: "bold" }}>
                      {user.id}
                    </div>
                  </Col>
                  <Col span={4}>
                    <Text style={{ color: "rgba(255,255,255,0.8)" }}>Coin</Text>
                    <div style={{ color: "white", fontWeight: "bold" }}>
                      {user.coin?.toLocaleString() || 0}
                    </div>
                  </Col>
                  <Col span={4}>
                    <Text style={{ color: "rgba(255,255,255,0.8)" }}>
                      Tổng nạp
                    </Text>
                    <div style={{ color: "white", fontWeight: "bold" }}>
                      {user.tongnap?.toLocaleString() || 0}
                    </div>
                  </Col>
                  <Col span={4}>
                    <Text style={{ color: "rgba(255,255,255,0.8)" }}>
                      Admin
                    </Text>
                    <div>
                      <Tag color={user.is_admin ? "green" : "default"}>
                        {user.is_admin ? "Có" : "Không"}
                      </Tag>
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          </Card>

          {/* Main Tabs */}
          <Tabs defaultActiveKey="gift" size="large">
            <TabPane
              tab={
                <span>
                  <GiftOutlined />
                  Tặng Items
                </span>
              }
              key="gift"
            >
              <Row gutter={24}>
                <Col span={8}>
                  <Card
                    extra={
                      <Input
                        placeholder="Tìm kiếm items..."
                        prefix={<SearchOutlined />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    }
                  >
                    <Table
                      columns={itemColumns}
                      dataSource={filteredItems}
                      rowKey="id"
                      size="small"
                      scroll={{ y: 400 }}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Tổng ${total} items`,
                      }}
                    />
                  </Card>
                </Col>

                {/* Items đã chọn */}
                <Col span={16}>
                  <Card
                    title={
                      <Space>
                        <SettingOutlined style={{ color: "#52c41a" }} />
                        Items đã chọn
                        {selectedItems.length > 0 && (
                          <Badge count={selectedItems.length} />
                        )}
                      </Space>
                    }
                    extra={
                      selectedItems.length > 0 && (
                        <Space>
                          <Button
                            icon={<SaveOutlined />}
                            onClick={handleAddToLocalStorage}
                          >
                            Lưu vào kho
                          </Button>
                        </Space>
                      )
                    }
                  >
                    <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                      {selectedItems.length === 0 ? (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "60px 0",
                            color: "#999",
                          }}
                        >
                          <InboxOutlined
                            style={{ fontSize: "48px", marginBottom: "16px" }}
                          />
                          <div>Chưa chọn item nào</div>
                          <Text type="secondary">
                            Hãy thêm items từ danh sách bên trái
                          </Text>
                        </div>
                      ) : (
                        <Space
                          direction="vertical"
                          size="middle"
                          style={{ width: "100%" }}
                        >
                          {selectedItems.map((selectedItem, index) => (
                            <Card
                              key={index}
                              size="small"
                              style={{ border: "1px solid #d9d9d9" }}
                              title={
                                <Space>
                                  <Text strong>{selectedItem.itemName}</Text>
                                  <Tag color="blue">
                                    ID: {selectedItem.itemId}
                                  </Tag>
                                </Space>
                              }
                              extra={
                                <Popconfirm
                                  title="Xóa item này?"
                                  onConfirm={() => removeSelectedItem(index)}
                                  okText="Có"
                                  cancelText="Không"
                                >
                                  <Button
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                  />
                                </Popconfirm>
                              }
                            >
                              <Space
                                direction="vertical"
                                style={{ width: "100%" }}
                              >
                                {/* Số lượng */}
                                <Row align="middle">
                                  <Col span={4}>
                                    <Text strong>Số lượng:</Text>
                                  </Col>
                                  <Col span={6}>
                                    <InputNumber
                                      min={1}
                                      value={selectedItem.quantity}
                                      onChange={(value) =>
                                        updateQuantity(index, value || 1)
                                      }
                                      style={{ width: "100%" }}
                                    />
                                  </Col>
                                </Row>

                                <Divider style={{ margin: "12px 0" }} />

                                {/* Thêm Options */}
                                <Row align="middle">
                                  <Col span={4}>
                                    <Text strong>Thêm Option:</Text>
                                  </Col>
                                  <Col span={12}>
                                    <Select
                                      placeholder="Chọn option để thêm"
                                      style={{ width: "100%" }}
                                      onSelect={(value) =>
                                        addOptionToItem(index, Number(value))
                                      }
                                      value={undefined}
                                    >
                                      {allOptions
                                        .filter(
                                          (option) =>
                                            !selectedItem.selectedOptions.some(
                                              (selected) =>
                                                selected.optionId === option.id,
                                            ),
                                        )
                                        .map((option) => (
                                          <Option
                                            key={option.id}
                                            value={option.id}
                                          >
                                            {option.NAME ||
                                              `Option ${option.id}`}
                                          </Option>
                                        ))}
                                    </Select>
                                  </Col>
                                </Row>

                                {/* Options đã chọn */}
                                {selectedItem.selectedOptions.length > 0 && (
                                  <div>
                                    <Row
                                      justify="space-between"
                                      align="middle"
                                      style={{ marginBottom: "8px" }}
                                    >
                                      <Text strong>
                                        Options đã chọn (
                                        {selectedItem.selectedOptions.length}):
                                      </Text>
                                      {selectedItem.selectedOptions.length >
                                        1 && (
                                        <Button
                                          size="small"
                                          type="link"
                                          onClick={() => {
                                            const updatedItems = [
                                              ...selectedItems,
                                            ];
                                            updatedItems[
                                              index
                                            ].selectedOptions = [];
                                            setSelectedItems(updatedItems);
                                            messageApi.success(
                                              "Đã xóa tất cả options",
                                            );
                                          }}
                                        >
                                          Xóa tất cả
                                        </Button>
                                      )}
                                    </Row>
                                    <Space
                                      direction="vertical"
                                      style={{ width: "100%" }}
                                    >
                                      {selectedItem.selectedOptions.map(
                                        (opt) => (
                                          <Card
                                            key={opt.optionId}
                                            size="small"
                                            style={{
                                              background:
                                                "linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%)",
                                              border: "1px solid #91d5ff",
                                            }}
                                          >
                                            <Row align="middle" gutter={12}>
                                              <Col span={6}>
                                                <Space>
                                                  <Tag color="blue">
                                                    #{opt.optionId}
                                                  </Tag>
                                                  <Text strong>
                                                    {opt.optionName}
                                                  </Text>
                                                </Space>
                                              </Col>
                                              <Col span={14}>
                                                <Input
                                                  placeholder="Nhập giá trị param (tùy chọn)"
                                                  value={opt.paramValue}
                                                  onChange={(e) =>
                                                    updateOptionParam(
                                                      index,
                                                      opt.optionId,
                                                      e.target.value,
                                                    )
                                                  }
                                                />
                                              </Col>
                                              <Col span={4}>
                                                <Popconfirm
                                                  title="Xóa option này?"
                                                  onConfirm={() =>
                                                    removeOptionFromItem(
                                                      index,
                                                      opt.optionId,
                                                    )
                                                  }
                                                  okText="Có"
                                                  cancelText="Không"
                                                >
                                                  <Button
                                                    danger
                                                    size="small"
                                                    icon={<DeleteOutlined />}
                                                    style={{ width: "100%" }}
                                                  />
                                                </Popconfirm>
                                              </Col>
                                            </Row>
                                          </Card>
                                        ),
                                      )}
                                    </Space>
                                    <Alert
                                      message={`💡 Tip: Bạn có thể thêm tối đa ${allOptions.length} options cho mỗi item`}
                                      type="info"
                                      showIcon
                                      style={{ marginTop: "8px" }}
                                    />
                                  </div>
                                )}
                              </Space>
                            </Card>
                          ))}
                        </Space>
                      )}
                    </div>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <InboxOutlined />
                  Kho lưu trữ ({localStorageItems.length})
                </span>
              }
              key="storage"
            >
              <Card
                title={
                  <Space>
                    <InboxOutlined style={{ color: "#722ed1" }} />
                    Kho lưu trữ Items
                  </Space>
                }
              >
                <Table
                  columns={storageColumns}
                  dataSource={localStorageItems}
                  rowKey={(record, index) => `${record.itemId}-${index}`}
                  locale={{
                    emptyText: (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "60px 0",
                          color: "#999",
                        }}
                      >
                        <InboxOutlined
                          style={{ fontSize: "48px", marginBottom: "16px" }}
                        />
                        <div>Kho lưu trữ trống</div>
                        <Text type="secondary">Chưa có item nào được lưu</Text>
                      </div>
                    ),
                  }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `Tổng ${total} items trong kho`,
                  }}
                />
              </Card>
            </TabPane>
          </Tabs>
        </Space>
      </div>
    </div>
  );
}
