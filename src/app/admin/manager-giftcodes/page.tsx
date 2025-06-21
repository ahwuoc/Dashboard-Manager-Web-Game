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
  DatePicker,
  Collapse, // Giữ lại import Collapse
  Divider,
} from "antd";
import {
  EditOutlined,
  GiftOutlined,
  DeleteOutlined,
  SearchOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  SettingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { apiGiftcode } from "@/app/handler/apiGiftcodes";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { Prisma } from "@/generated/prisma";
import { useRouter } from "next/navigation";
import debounce from "lodash/debounce";
const { Title, Text } = Typography;
const { Search } = Input;

export type GiftcodeWithItemsAndOptions = Prisma.giftcodeGetPayload<{
  include: {
    giftcode_items: {
      include: {
        item_template: { select: { id: true; NAME: true } };
        giftcode_item_options: {
          include: {
            item_option_template: { select: { id: true; NAME: true } };
          };
        };
      };
    };
  };
}>;
import LinkPath from "@/app/common/link";
interface CreateGiftcodeFormValues {
  code: string;
  count_left: number;
  expired: dayjs.Dayjs;
}

const GiftcodeManagementPage: React.FC = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedGiftcode, setSelectedGiftcode] =
    useState<GiftcodeWithItemsAndOptions | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [giftcodes, setGiftcodes] = useState<GiftcodeWithItemsAndOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [editForm] = Form.useForm();
  const [createForm] = Form.useForm<CreateGiftcodeFormValues>();

  const fetchGiftcodes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiGiftcode.getAll();
      setGiftcodes(response.payload?.data || []);
    } catch (error) {
      console.error("Error fetching giftcodes:", error);
      messageApi.error("Không thể tải danh sách giftcode!");
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    fetchGiftcodes();
  }, [fetchGiftcodes]);

  const debouncedSearch = useCallback(
    debounce((value: string) => setSearch(value), 300),
    [],
  );

  const filteredGiftcodes = giftcodes.filter(
    (giftcode) =>
      giftcode.code?.toLowerCase().includes(search.toLowerCase()) ||
      giftcode.id.toString().includes(search.toLowerCase()),
  );

  const handleEditClick = (giftcode: GiftcodeWithItemsAndOptions) => {
    setSelectedGiftcode(giftcode);
    editForm.setFieldsValue({
      code: giftcode.code,
      count_left: giftcode.count_left,
      expired: dayjs(giftcode.expired),
    });
    setIsEditModalOpen(true);
  };

  const handleEditOptionsClick = (giftcodeId: number) => {
    router.push(`${LinkPath.manager_giftcodes}/${giftcodeId}`);
  };

  const handleEditSubmit = async (values: GiftcodeWithItemsAndOptions) => {
    if (!selectedGiftcode) return;

    try {
      setEditLoading(true);
      const updatedData = {
        ...values,
        expired: values.expired.toISOString(),
      };
      const response = await apiGiftcode.update(
        selectedGiftcode.id,
        updatedData,
      );
      if (response.payload?.data) {
        fetchGiftcodes();
        messageApi.success("Cập nhật giftcode thành công!");
      } else {
        messageApi.error("Cập nhật giftcode thất bại!");
      }
      setIsEditModalOpen(false);
      editForm.resetFields();
    } catch (error) {
      console.error("Error updating giftcode:", error);
      messageApi.error("Không thể cập nhật giftcode!");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteGiftcode = async (giftcodeId: number) => {
    try {
      await apiGiftcode.delete(giftcodeId);
      setGiftcodes(giftcodes.filter((giftcode) => giftcode.id !== giftcodeId));
      messageApi.success("Xóa giftcode thành công!");
    } catch (error) {
      console.error("Error deleting giftcode:", error);
      messageApi.error("Không thể xóa giftcode!");
    }
  };

  const handleCreateNewGiftcode = () => {
    createForm.resetFields();
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (values: CreateGiftcodeFormValues) => {
    try {
      setCreateLoading(true);
      const newGiftcodeData = {
        ...values,
        expired: values.expired.toISOString(),
      };

      const response = await apiGiftcode.create(newGiftcodeData);
      if (response.payload?.data) {
        messageApi.success("Tạo giftcode mới thành công!");
        fetchGiftcodes();
      } else {
        messageApi.error("Tạo giftcode thất bại!");
      }
      setIsCreateModalOpen(false);
      createForm.resetFields();
    } catch (error) {
      console.error("Error creating giftcode:", error);
      messageApi.error("Không thể tạo giftcode mới!");
    } finally {
      setCreateLoading(false);
    }
  };

  // Render giftcode items
  const renderGiftcodeItems = (items: any[]) => {
    if (!items?.length) {
      return <Text type="secondary">Không có item</Text>;
    }

    // Chuyển đổi mảng items thành định dạng mà Collapse.items mong đợi
    const collapseItems = items.map((item, index) => ({
      key: String(index), // key phải là string
      label: (
        <Space>
          <AppstoreOutlined />
          <Text strong>
            {item.item_template?.NAME || `Item ${item.item_id}`}
          </Text>
          <Tag color="blue">x{item.quantity}</Tag>
        </Space>
      ),
      children: (
        <div style={{ paddingLeft: 16 }}>
          <Text strong>ID:</Text> {item.id}
          <br />
          <Text strong>Tên:</Text> {item.item_template?.NAME || "N/A"}
          <br />
          <Text strong>Số lượng:</Text> {item.quantity}
          <br />
          {item.giftcode_item_options?.length > 0 && (
            <>
              <Divider style={{ margin: "8px 0" }} />
              <Text strong>Options:</Text>
              {item.giftcode_item_options.map(
                (option: any, optIndex: number) => (
                  <div key={optIndex} style={{ marginLeft: 16, marginTop: 4 }}>
                    <Space>
                      <SettingOutlined />
                      <Text>
                        {option.item_option_template?.NAME ||
                          `Option ${option.option_id}`}
                        :
                      </Text>
                      <Tag color="green">{option.param}</Tag>
                    </Space>
                  </div>
                ),
              )}
            </>
          )}
        </div>
      ),
    }));

    return (
      <Collapse size="small" ghost items={collapseItems} /> // Sử dụng prop `items`
    );
  };

  const columns: ColumnsType<GiftcodeWithItemsAndOptions> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
      render: (id: number) => <Text code>{id}</Text>,
    },
    {
      title: "Mã Giftcode",
      dataIndex: "code",
      key: "code",
      width: 200,
      sorter: (a, b) => (a.code || "").localeCompare(b.code || ""),
      render: (code: string) => (
        <Space>
          <GiftOutlined />
          <Text strong copyable>
            {code || "N/A"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Số lượng còn lại",
      dataIndex: "count_left",
      key: "count_left",
      width: 120,
      sorter: (a, b) => (a.count_left || 0) - (b.count_left || 0),
      render: (count: number) => (
        <Tag color={count > 0 ? "green" : "red"}>{count ?? 0}</Tag>
      ),
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "expired",
      key: "expired",
      width: 150,
      sorter: (a, b) =>
        new Date(a.expired).getTime() - new Date(b.expired).getTime(),
      render: (date: string) => {
        const isExpired = dayjs(date).isBefore(dayjs());
        return (
          <Space>
            <CalendarOutlined />
            <Text style={{ color: isExpired ? "#ff4d4f" : "#52c41a" }}>
              {dayjs(date).format("DD/MM/YYYY HH:mm")}
            </Text>
          </Space>
        );
      },
    },
    {
      title: "Items & Options",
      dataIndex: "giftcode_items",
      key: "giftcode_items",
      width: 300,
      render: renderGiftcodeItems,
    },
    {
      title: "Hành động",
      key: "action",
      width: 180,
      render: (_, record) => (
        <Space size="small" direction="vertical">
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
            >
              Options
            </Button>
          </Space>
          <Popconfirm
            title="Xóa giftcode"
            description={`Bạn có chắc chắn muốn xóa giftcode "${record.code}"?`}
            onConfirm={() => handleDeleteGiftcode(record.id)}
            okText="Có"
            cancelText="Không"
            okType="danger"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              style={{ width: "100%" }}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const totalGiftcodes = giftcodes.length;
  const activeGiftcodes = giftcodes.filter((gc) => gc.count_left > 0).length;
  const expiredGiftcodes = giftcodes.filter((gc) =>
    dayjs(gc.expired).isBefore(dayjs()),
  ).length;
  const totalItemsLeft = giftcodes.reduce(
    (sum, gc) => sum + (gc.count_left || 0),
    0,
  );

  return (
    <div style={{ padding: 24, background: "#f0f2f5" }}>
      {contextHolder}
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} lg={12}>
              <Space align="center">
                <GiftOutlined style={{ fontSize: 32, color: "#1890ff" }} />
                <div>
                  <Title level={3} style={{ margin: 0 }}>
                    Quản lý Giftcode
                  </Title>
                  <Text type="secondary">
                    Quản lý mã giftcode và phần thưởng
                  </Text>
                </div>
              </Space>
            </Col>
            <Col xs={24} lg={12}>
              <Row gutter={[16, 16]}>
                {[
                  {
                    title: "Tổng Giftcode",
                    value: totalGiftcodes,
                    color: "#1890ff",
                    prefix: <GiftOutlined />,
                  },
                  {
                    title: "Còn hiệu lực",
                    value: activeGiftcodes,
                    color: "#52c41a",
                  },
                  {
                    title: "Đã hết hạn",
                    value: expiredGiftcodes,
                    color: "#f5222d",
                  },
                  {
                    title: "Tổng SL còn lại",
                    value: totalItemsLeft,
                    color: "#faad14",
                  },
                ].map((stat, index) => (
                  <Col xs={12} sm={6} key={index}>
                    <Statistic
                      title={stat.title}
                      value={stat.value}
                      prefix={stat.prefix}
                      valueStyle={{ color: stat.color }}
                    />
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Card>

        <Card>
          <Row gutter={[16, 16]} justify="space-between" align="middle">
            <Col xs={24} sm={12} md={8} lg={6}>
              <Search
                placeholder="Tìm kiếm theo ID hoặc mã giftcode..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onChange={(e) => debouncedSearch(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} style={{ textAlign: "right" }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={handleCreateNewGiftcode}
              >
                Tạo Giftcode Mới
              </Button>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={filteredGiftcodes}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]} - ${range[1]} của ${total} giftcode`,
              pageSizeOptions: ["10", "20", "50"],
            }}
            scroll={{ x: 1000 }}
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
                  <GiftOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
                  <Text type="secondary">Không tìm thấy giftcode nào</Text>
                  <Button
                    type="dashed"
                    onClick={handleCreateNewGiftcode}
                    icon={<PlusOutlined />}
                  >
                    Tạo Giftcode đầu tiên
                  </Button>
                </Space>
              ),
            }}
          />
        </Card>

        <Modal
          title={
            <Space>
              <EditOutlined />
              Chỉnh sửa Giftcode
            </Space>
          }
          open={isEditModalOpen}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedGiftcode(null);
            editForm.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Mã Giftcode"
                  name="code"
                  rules={[
                    { required: true, message: "Vui lòng nhập mã giftcode!" },
                    { min: 3, message: "Mã giftcode phải có ít nhất 3 ký tự!" },
                  ]}
                >
                  <Input
                    prefix={<GiftOutlined />}
                    placeholder="Nhập mã giftcode"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Số lượng còn lại"
                  name="count_left"
                  rules={[
                    { required: true, message: "Vui lòng nhập số lượng!" },
                    {
                      type: "number",
                      min: 0,
                      message: "Số lượng phải lớn hơn hoặc bằng 0!",
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="Nhập số lượng"
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label="Ngày hết hạn"
              name="expired"
              rules={[
                { required: true, message: "Vui lòng chọn ngày hết hạn!" },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY HH:mm"
                showTime={{ format: "HH:mm" }}
                placeholder="Chọn ngày hết hạn"
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
              <Space>
                <Button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedGiftcode(null);
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

        <Modal
          title={
            <Space>
              <PlusOutlined />
              Tạo Giftcode Mới
            </Space>
          }
          open={isCreateModalOpen}
          onCancel={() => {
            setIsCreateModalOpen(false);
            createForm.resetFields();
          }}
          footer={null}
          width={600}
          destroyOnClose
        >
          <Form
            form={createForm}
            layout="vertical"
            onFinish={handleCreateSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Mã Giftcode"
                  name="code"
                  rules={[
                    { required: true, message: "Vui lòng nhập mã giftcode!" },
                    { min: 3, message: "Mã giftcode phải có ít nhất 3 ký tự!" },
                  ]}
                >
                  <Input
                    prefix={<GiftOutlined />}
                    placeholder="Nhập mã giftcode"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Số lượng còn lại"
                  name="count_left"
                  rules={[
                    { required: true, message: "Vui lòng nhập số lượng!" },
                    {
                      type: "number",
                      min: 0,
                      message: "Số lượng phải lớn hơn hoặc bằng 0!",
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="Nhập số lượng"
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label="Ngày hết hạn"
              name="expired"
              rules={[
                { required: true, message: "Vui lòng chọn ngày hết hạn!" },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY HH:mm"
                showTime={{ format: "HH:mm" }}
                placeholder="Chọn ngày hết hạn"
              />
            </Form.Item>
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
                >
                  {createLoading ? "Đang tạo..." : "Tạo Giftcode"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Space>
    </div>
  );
};

export default GiftcodeManagementPage;
