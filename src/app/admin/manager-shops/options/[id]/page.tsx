"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Space,
  Typography,
  message,
  Row,
  Col,
  Table,
  InputNumber,
  Divider,
  Tag,
  Spin,
  Alert,
  Breadcrumb,
  Popconfirm,
  Modal,
  Form,
  Select,
} from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  SettingOutlined,
  PlusOutlined,
  DeleteOutlined,
  HomeOutlined,
  ShopOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import { apiShopItems } from "@/app/handler/apiShopItems";
import type { ColumnsType } from "antd/es/table";
import { item_option_template, Prisma } from "@/generated/prisma";
import { apiOptions } from "@/app/handler/apiOptions";

const { Title, Text } = Typography;
const { Option } = Select;

export type ItemShopOptionWithTemplate = Prisma.item_shop_optionGetPayload<{
  include: { item_option_template: true };
}>;

export default function ShopOptionsPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = parseInt(params.id as string);

  const [loading, setLoading] = useState(true);
  const [item_shop_options, set_item_shop_options] = useState<
    ItemShopOptionWithTemplate[]
  >([]);
  const [options, setOptions] = useState<item_option_template[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] =
    useState<ItemShopOptionWithTemplate | null>(null);
  const [editIndex, setEditIndex] = useState<number>(-1);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();

  useEffect(() => {
    if (itemId) {
      fetchShopItemAndOptions();
      fetchOptions();
    }
  }, [itemId]);

  const fetchOptions = async () => {
    try {
      const response = await apiOptions.getAll();
      if (response.payload) {
        setOptions(response.payload.data);
      }
    } catch (error) {
      console.error("Lỗi khi fetch options templates:", error);
      messageApi.error("Không thể tải danh sách option templates");
    }
  };

  const fetchShopItemAndOptions = async () => {
    try {
      setLoading(true);
      const itemResponse = await apiShopItems.getOptionsById(itemId);
      if (itemResponse.payload) {
        set_item_shop_options(itemResponse.payload.data);
      }
    } catch (error) {
      console.error("Lỗi khi fetch dữ liệu:", error);
      messageApi.error("Không thể tải thông tin item và options");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = () => {
    addForm.resetFields();
    setIsAddModalOpen(true);
  };

  const handleEditOption = (
    record: ItemShopOptionWithTemplate,
    index: number,
  ) => {
    setSelectedOption(record);
    setEditIndex(index);
    form.setFieldsValue({
      param: record.param,
      option_id: record.option_id,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteOption = async (
    index: number,
    item_shop_id: number,
    option_id: number,
  ) => {
    try {
      const response = await apiShopItems.deleteOption({
        item_shop_id,
        option_id,
      });

      if (response.status === 200) {
        const newOptions = item_shop_options.filter((_, i) => i !== index);
        set_item_shop_options(newOptions);
        messageApi.success("Xóa option thành công!");
      } else {
        messageApi.error("Xóa option thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi xóa option:", error);
      messageApi.error("Không thể xóa option");
    }
  };

  const handleSaveEdit = async (values: ItemShopOptionWithTemplate) => {
    if (editIndex === -1 || !selectedOption) return;

    try {
      const response = await apiShopItems.updateOption({
        item_shop_id: selectedOption.item_shop_id,
        option_id: selectedOption.option_id,
        new_option_id: values.option_id,
        param: values.param,
      });

      if (response.status === 200) {
        await fetchShopItemAndOptions();
        setIsEditModalOpen(false);
        setSelectedOption(null);
        setEditIndex(-1);
        form.resetFields();
        messageApi.success("Cập nhật option thành công!");
      } else {
        messageApi.error("Cập nhật option thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật option:", error);
      messageApi.error("Không thể cập nhật option");
    }
  };

  const handleSaveNewOption = async (values: ItemShopOptionWithTemplate) => {
    try {
      const response = await apiShopItems.createOption({
        item_shop_id: itemId,
        option_id: values.option_id,
        param: values.param,
      });

      if (response.status === 200 || response.status === 201) {
        await fetchShopItemAndOptions();
        setIsAddModalOpen(false);
        addForm.resetFields();
        messageApi.success("Thêm option thành công!");
      } else {
        messageApi.error("Thêm option thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi thêm option:", error);
      messageApi.error("Không thể thêm option");
    }
  };

  const columns: ColumnsType<ItemShopOptionWithTemplate> = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Item Shop ID",
      dataIndex: "item_shop_id",
      key: "item_shop_id",
      width: 120,
      render: (id: number) => <Text code>{id}</Text>,
    },
    {
      title: "Option ID",
      dataIndex: "option_id",
      key: "option_id",
      width: 100,
      render: (id: number) => <Text code>{id}</Text>,
    },
    {
      title: "Template ID",
      dataIndex: ["item_option_template", "id"],
      key: "template_id",
      width: 120,
      render: (id: number) => <Text>{id}</Text>,
    },
    {
      title: "Tên Option",
      dataIndex: ["item_option_template", "NAME"],
      key: "option_name",
      render: (name: string) => <Text strong>{name || "Chưa có tên"}</Text>,
    },
    {
      title: "Param",
      dataIndex: "param",
      key: "param",
      width: 100,
      render: (param: number) => <Tag color="blue">{param}</Tag>,
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      render: (_, record, index) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditOption(record, index)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa option"
            description={`Bạn có chắc chắn muốn xóa option với khóa [${record.item_shop_id}, ${record.option_id}]?`}
            onConfirm={() =>
              handleDeleteOption(index, record.item_shop_id, record.option_id)
            }
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

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: "16px" }}>
          <Text>Đang tải thông tin...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {contextHolder}

      <Breadcrumb style={{ marginBottom: "24px" }}>
        <Breadcrumb.Item>
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <ShopOutlined />
          <span>Shop Management</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <SettingOutlined />
          Options
        </Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <Card style={{ marginBottom: "24px" }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space align="center">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.back()}
              >
                Quay lại
              </Button>
              <Divider type="vertical" />
              <SettingOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  Quản lý Options
                </Title>
                <Text type="secondary">Item ID: {itemId}</Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddOption}
              >
                Thêm Option
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Options Table */}
      <Card title={`Danh sách Options (${item_shop_options.length})`}>
        {item_shop_options.length === 0 ? (
          <Alert
            message="Chưa có options nào"
            description="Nhấn nút 'Thêm Option' để tạo option mới cho item này."
            type="info"
            showIcon
            style={{ marginBottom: "16px" }}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={item_shop_options}
            rowKey={(record) => `${record.item_shop_id}-${record.option_id}`}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} options`,
            }}
            scroll={{ x: 800 }}
            size="middle"
            bordered
          />
        )}
      </Card>

      {/* Add Modal */}
      <Modal
        title={
          <Space>
            <PlusOutlined />
            Thêm Option Mới
          </Space>
        }
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          addForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={addForm} layout="vertical" onFinish={handleSaveNewOption}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Option Template"
                name="option_id"
                rules={[
                  { required: true, message: "Vui lòng chọn option template!" },
                ]}
              >
                <Select
                  placeholder="Chọn option template"
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.children)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {options.map((option) => (
                    <Option key={option.id} value={option.id}>
                      {option.id} - {option.NAME}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Param"
                name="param"
                rules={[{ required: true, message: "Vui lòng nhập Param!" }]}
              >
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setIsAddModalOpen(false);
                  addForm.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Thêm Option
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            Chỉnh sửa Option
          </Space>
        }
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedOption(null);
          setEditIndex(-1);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveEdit}>
          <Alert
            message="Lưu ý"
            description="Khóa chính của bảng này là [item_shop_id, option_id]. Thay đổi option_id sẽ tạo record mới và xóa record cũ."
            type="warning"
            showIcon
            style={{ marginBottom: "16px" }}
          />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Option Template"
                name="option_id"
                rules={[
                  { required: true, message: "Vui lòng chọn option template!" },
                ]}
              >
                <Select
                  placeholder="Chọn option template"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label as string)
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={options.map((option) => ({
                    value: option.id,
                    label: `${option.id} - ${option.NAME}`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Param"
                name="param"
                rules={[{ required: true, message: "Vui lòng nhập Param!" }]}
              >
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedOption(null);
                  setEditIndex(-1);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
