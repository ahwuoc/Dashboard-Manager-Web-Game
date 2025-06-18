"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  Card,
  Button,
  Modal,
  Space,
  Typography,
  message,
  Popconfirm,
  Tag,
  Row,
  Col,
  Spin,
  Form,
  Select,
  InputNumber,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { apiGiftcode } from "@/app/handler/apiGiftcodes";
import type { ColumnsType } from "antd/es/table";
import { useRouter, useParams } from "next/navigation";
import { apiOptions } from "@/app/handler/apiOptions";
import { item_template, Prisma } from "@/generated/prisma";
import { apiItems } from "@/app/handler/apiItems";

const { Title, Text } = Typography;
const { Option } = Select;

type ItemTemplate = Pick<item_template, "id" | "NAME">;

type ItemOptionTemplate = {
  id: number;
  NAME: string;
};

export type GiftcodeItemOption = Prisma.giftcode_item_optionsGetPayload<{
  include: {
    item_option_template: {
      select: {
        id: true;
        NAME: true;
      };
    };
  };
}>;

export type GiftcodeItemWithOptions = Prisma.giftcode_itemsGetPayload<{
  include: {
    item_template: {
      select: {
        id: true;
        NAME: true;
      };
    };
    giftcode_item_options: {
      include: {
        item_option_template: {
          select: {
            id: true;
            NAME: true;
          };
        };
      };
    };
  };
}>;

interface OptionFormValues {
  giftcode_item_id?: number;
  option_id: number;
  param: number;
}

interface GiftcodeItemFormValues {
  item_template_id: number;
  quantity: number;
}

const GiftcodeOptionsPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const giftcodeId = params.id;

  const [giftcodeItems, setGiftcodeItems] = useState<GiftcodeItemWithOptions[]>(
    [],
  );
  const [availableOptions, setAvailableOptions] = useState<
    ItemOptionTemplate[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [availableItems, setAvailableItems] = useState<item_template[]>([]);
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] =
    useState<GiftcodeItemOption | null>(null);
  const [optionForm] = Form.useForm<OptionFormValues>();
  const [itemForm] = Form.useForm<GiftcodeItemFormValues>();
  const [messageApi, contextHolder] = message.useMessage();

  const [currentGiftcodeItemIdForOption, setCurrentGiftcodeItemIdForOption] =
    useState<number | null>(null);

  const giftcodeIdNumber = useMemo(() => {
    return giftcodeId ? Number(String(giftcodeId)) : 0;
  }, [giftcodeId]);

  const fetchData = useCallback(async () => {
    if (!giftcodeIdNumber) {
      messageApi.error("Không tìm thấy Giftcode ID!");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let giftcodeItemsResponse, optionsResponse, itemsResponse;

      // Tách ra tránh lỗi
      try {
        giftcodeItemsResponse = await apiGiftcode.getById(giftcodeIdNumber);
        console.log("✅ Giftcode response:", giftcodeItemsResponse);
      } catch (err) {
        console.error("❌ Lỗi getById:", err);
      }

      try {
        optionsResponse = await apiOptions.getAll();
        console.log("✅ Options response:", optionsResponse);
      } catch (err) {
        console.error("❌ Lỗi getAll options:", err);
      }

      try {
        itemsResponse = await apiItems.getAll();
        console.log("✅ Items response:", itemsResponse);
      } catch (err) {
        console.error("❌ Lỗi getAll items:", err);
      }
      setGiftcodeItems(giftcodeItemsResponse?.payload?.data || []);
      setAvailableOptions(optionsResponse?.payload?.data || []);
      setAvailableItems(itemsResponse?.payload?.data || []);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu giftcode items hoặc options:", error);
      messageApi.error("Không thể tải dữ liệu giftcode items hoặc options!");
    } finally {
      setLoading(false);
    }
  }, [giftcodeIdNumber, messageApi]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpsertOption = async (values: OptionFormValues) => {
    try {
      const actualGiftcodeItemId = selectedOption
        ? selectedOption.giftcode_item_id
        : currentGiftcodeItemIdForOption;

      if (actualGiftcodeItemId === null) {
        messageApi.error("Không xác định được Item để thêm/sửa option!");
        return;
      }

      const payload = {
        giftcode_item_id: actualGiftcodeItemId,
        option_id: values.option_id,
        param: values.param,
      };

      if (selectedOption) {
        const response = await apiGiftcode.updateOption(
          selectedOption.id,
          payload,
        );
        if (response.payload && response.payload.data) {
          messageApi.success("Cập nhật option thành công!");
          fetchData(); // Fetch lại dữ liệu sau khi cập nhật thành công
        } else {
          messageApi.error("Cập nhật option thất bại!");
        }
      } else {
        const response = await apiGiftcode.addOption(
          actualGiftcodeItemId,
          payload,
        );
        if (response.payload?.data) {
          messageApi.success("Thêm option thành công!");
          fetchData(); // Fetch lại dữ liệu sau khi thêm mới thành công
        } else {
          messageApi.error("Thêm option thất bại!");
        }
      }

      handleCloseOptionModal();
    } catch (error) {
      console.error("Lỗi khi lưu option:", error);
      messageApi.error("Không thể lưu option!");
    }
  };

  const handleDeleteOption = async (optionId: number) => {
    try {
      await apiGiftcode.deleteOption(optionId);
      messageApi.success("Xóa option thành công!");
      fetchData(); // Fetch lại dữ liệu sau khi xóa thành công
    } catch (error) {
      console.error("Lỗi khi xóa option:", error);
      messageApi.error("Không thể xóa option!");
    }
  };

  const handleEditClick = (option: GiftcodeItemOption) => {
    setSelectedOption(option);
    optionForm.setFieldsValue({
      giftcode_item_id: option.giftcode_item_id,
      option_id: option.option_id!,
      param: option.param,
    });
    setCurrentGiftcodeItemIdForOption(option.giftcode_item_id);
    setIsOptionModalOpen(true);
  };

  const handleCloseOptionModal = () => {
    setIsOptionModalOpen(false);
    setSelectedOption(null);
    optionForm.resetFields();
    setCurrentGiftcodeItemIdForOption(null);
  };

  const handleAddNewOption = (giftcodeItemId: number) => {
    setSelectedOption(null);
    optionForm.resetFields();
    setCurrentGiftcodeItemIdForOption(giftcodeItemId);
    setIsOptionModalOpen(true);
  };

  const handleAddItem = async (values: GiftcodeItemFormValues) => {
    try {
      const payload = {
        giftcode_id: giftcodeIdNumber,
        item_id: values.item_template_id,
        quantity: values.quantity,
      };
      const response = await apiGiftcode.addItem(payload);
      if (response.payload?.data) {
        messageApi.success("Thêm Giftcode Item thành công!");
        fetchData(); // Fetch lại dữ liệu sau khi thêm item thành công
      } else {
        messageApi.error("Thêm Giftcode Item thất bại!");
      }
      handleCloseItemModal();
    } catch (error) {
      console.error("Lỗi khi thêm Giftcode Item:", error);
      messageApi.error("Không thể thêm Giftcode Item!");
    }
  };

  const handleCloseItemModal = () => {
    setIsItemModalOpen(false);
    itemForm.resetFields();
  };

  const handleAddNewItem = () => {
    itemForm.resetFields();
    setIsItemModalOpen(true);
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      await apiGiftcode.deleteItem(itemId.toString()); // API deleteItem của bạn chỉ nhận itemId, không cần giftcodeId
      messageApi.success("Xóa Giftcode Item thành công!");
      fetchData(); // Fetch lại dữ liệu sau khi xóa item thành công
    } catch (error) {
      console.error("Lỗi khi xóa Giftcode Item:", error);
      messageApi.error("Không thể xóa Giftcode Item!");
    }
  };

  const itemColumns: ColumnsType<GiftcodeItemWithOptions> = [
    {
      title: "ID Item",
      dataIndex: "id",
      key: "id",
      width: 100,
      sorter: (a, b) => a.id - b.id,
      render: (id: number) => <Text code>{id}</Text>,
    },
    {
      title: "Tên Item",
      dataIndex: ["item_template", "NAME"],
      key: "item_name",
      width: 250,
      render: (text: string, record) => (
        <Space direction="vertical" size="small">
          <Text strong>{text || `Item ID: ${record.item_template?.id}`}</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Số lượng: {record.quantity || 0}
          </Text>
        </Space>
      ),
    },
    {
      title: "Hành động (Item)",
      key: "item_action",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => handleAddNewOption(record.id)}
          >
            Thêm Option
          </Button>
          <Popconfirm
            title="Xóa Item"
            description="Bạn có chắc chắn muốn xóa item này và tất cả options của nó?"
            onConfirm={() => handleDeleteItem(record.id)}
            okText="Có"
            cancelText="Không"
            okType="danger"
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa Item
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const nestedOptionColumns: ColumnsType<GiftcodeItemOption> = [
    {
      title: "ID Option",
      dataIndex: "id",
      key: "option_id",
      width: 100,
      render: (id: number) => <Text code>{id}</Text>,
    },
    {
      title: "Tên Option",
      dataIndex: ["item_option_template", "NAME"],
      key: "option_name",
      width: 200,
      render: (text: string, record) => (
        <Text>{text || `Option ID: ${record.item_option_template?.id}`}</Text>
      ),
    },
    {
      title: "Giá trị",
      dataIndex: "param",
      key: "param_value",
      width: 100,
      render: (param: number) => <Tag color="green">{param}</Tag>,
    },
    {
      title: "Hành động (Option)",
      key: "option_action",
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
          <Popconfirm
            title="Xóa option"
            description="Bạn có chắc chắn muốn xóa option này?"
            onConfirm={() => handleDeleteOption(record.id)}
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

  return (
    <div style={{ padding: 24, background: "#f0f2f5" }}>
      {contextHolder}
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} lg={12}>
              <Space align="center">
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => router.push("/admin/giftcodes")}
                >
                  Quay lại
                </Button>
                <Title level={3} style={{ margin: 0 }}>
                  Quản lý Options của Giftcode {giftcodeId}
                </Title>
              </Space>
            </Col>
            <Col xs={24} lg={12} style={{ textAlign: "right" }}>
              <Button
                type="primary"
                icon={<ShoppingOutlined />}
                onClick={handleAddNewItem}
              >
                Thêm Item mới
              </Button>
            </Col>
          </Row>
        </Card>

        <Card>
          <Table
            columns={itemColumns}
            dataSource={giftcodeItems}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} items`,
              pageSizeOptions: ["10", "20", "50"],
            }}
            scroll={{ x: 800 }}
            size="middle"
            bordered
            expandable={{
              expandedRowRender: (record) => (
                <Card size="small" style={{ margin: "10px 0" }}>
                  <Title level={5} style={{ marginTop: 0 }}>
                    Options của{" "}
                    {record.item_template?.NAME || `Item ${record.id}`}
                  </Title>
                  <Table
                    columns={nestedOptionColumns}
                    dataSource={record.giftcode_item_options}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    bordered
                    locale={{
                      emptyText: (
                        <Text type="secondary">
                          Chưa có option nào cho item này.{" "}
                          <Button
                            type="link"
                            onClick={() => handleAddNewOption(record.id)}
                            icon={<PlusOutlined />}
                            size="small"
                          >
                            Thêm ngay!
                          </Button>
                        </Text>
                      ),
                    }}
                  />
                </Card>
              ),
              rowExpandable: (record) =>
                record.giftcode_item_options &&
                record.giftcode_item_options.length > 0,
            }}
            locale={{
              emptyText: loading ? (
                <Spin tip="Đang tải dữ liệu..." />
              ) : (
                <Space
                  direction="vertical"
                  align="center"
                  style={{ padding: "50px 0" }}
                >
                  <Text type="secondary">
                    Chưa có item nào trong giftcode này.
                  </Text>
                  <Button
                    type="dashed"
                    onClick={handleAddNewItem}
                    icon={<ShoppingOutlined />}
                  >
                    Thêm Item đầu tiên
                  </Button>
                </Space>
              ),
            }}
          />
        </Card>

        {/* Modal Add/Edit Option */}
        <Modal
          title={selectedOption ? "Sửa Option" : "Thêm Option"}
          open={isOptionModalOpen}
          onCancel={handleCloseOptionModal}
          footer={null}
          width={500}
          destroyOnClose
        >
          <Form
            form={optionForm}
            layout="vertical"
            onFinish={handleUpsertOption}
            preserve={false}
          >
            <Row gutter={16}>
              {/* Chỉ hiển thị trường Item khi sửa và luôn disabled */}
              {selectedOption && (
                <Col span={24}>
                  <Form.Item label="Item" name="giftcode_item_id">
                    <Select
                      placeholder="Chọn item"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.children as unknown as string)
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      disabled
                    >
                      {giftcodeItems.map((item) => (
                        <Option key={item.id} value={item.id}>
                          {item.item_template?.NAME || `Item ${item.id}`} (SL:{" "}
                          {item.quantity})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              )}
              <Col span={24}>
                <Form.Item
                  label="Option"
                  name="option_id"
                  rules={[{ required: true, message: "Vui lòng chọn option!" }]}
                >
                  <Select
                    placeholder="Chọn option"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {availableOptions.map((opt) => (
                      <Option key={opt.id} value={opt.id}>
                        {opt.NAME}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label="Giá trị"
                  name="param"
                  rules={[
                    { required: true, message: "Vui lòng nhập giá trị!" },
                    {
                      type: "number",
                      min: 0,
                      message: "Giá trị phải là số không âm!",
                    },
                  ]}
                >
                  <InputNumber
                    placeholder="Nhập giá trị (VD: 100)"
                    style={{ width: "100%" }}
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
              <Space>
                <Button onClick={handleCloseOptionModal}>Hủy</Button>
                <Button type="primary" htmlType="submit">
                  {selectedOption ? "Cập nhật" : "Thêm"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* New Modal for Add Giftcode Item */}
        <Modal
          title="Thêm Giftcode Item mới"
          open={isItemModalOpen}
          onCancel={handleCloseItemModal}
          footer={null}
          width={500}
          destroyOnClose
        >
          <Form
            form={itemForm}
            layout="vertical"
            onFinish={handleAddItem}
            preserve={false}
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Item Template"
                  name="item_template_id"
                  rules={[{ required: true, message: "Vui lòng chọn item!" }]}
                >
                  <Select
                    placeholder="Chọn item template"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {availableItems.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.NAME}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label="Số lượng"
                  name="quantity"
                  rules={[
                    { required: true, message: "Vui lòng nhập số lượng!" },
                    {
                      type: "number",
                      min: 1,
                      message: "Số lượng phải là số nguyên dương!",
                    },
                  ]}
                >
                  <InputNumber
                    placeholder="Nhập số lượng (VD: 1)"
                    style={{ width: "100%" }}
                    min={1}
                    precision={0}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
              <Space>
                <Button onClick={handleCloseItemModal}>Hủy</Button>
                <Button type="primary" htmlType="submit">
                  Thêm Item
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Space>
    </div>
  );
};
export default GiftcodeOptionsPage;
