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
  Tag,
  Row,
  Col,
  Statistic,
  Form,
  InputNumber,
  Select,
} from "antd";
import {
  EditOutlined,
  BoxPlotOutlined,
  GiftOutlined,
  ApartmentOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { item_option_template, item_template } from "@/generated/prisma";
import debounce from "lodash/debounce";
import { apiOpenItems } from "@/app/handler/apiOpenItems";
import { apiItems } from "@/app/handler/apiItems";
import { apiOptions } from "@/app/handler/apiOptions";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
interface ItemTemplate {
  NAME: string;
  id: number;
}
interface ItemOptionTemplate {
  NAME: string;
  id: number;
}
interface BoxItemDropOption {
  id?: number;
  option_id: number;
  option_param: number;
  item_option_template: ItemOptionTemplate;
}
interface BoxItemDrop {
  id?: number;
  item_template_id: number;
  quantity_min: number;
  quantity_max: number;
  drop_rate: number;
  item_template: ItemTemplate;
  box_item_drop_options: BoxItemDropOption[];
}
export interface BoxItemAction {
  id: number;
  template_item_id: number;
  open_mode: string;
  item_template: ItemTemplate;
  box_item_drops: BoxItemDrop[];
}
interface ActionFormValues {
  template_item_id: number;
  open_mode: string;
  box_item_drops: {
    item_template_id: number;
    quantity_min: number;
    quantity_max: number;
    drop_rate: number;
    box_item_drop_options: {
      option_id: number;
      option_param: number;
    }[];
  }[];
}

const BoxActionManagementPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [actions, setActions] = useState<BoxItemAction[]>([]);
  const [selectedAction, setSelectedAction] = useState<BoxItemAction | null>(
    null,
  );
  const [itemsTemplate, setItemsTemplate] = useState<item_template[]>([]);
  const [optionsTemplate, setOptionsTemplate] = useState<
    item_option_template[]
  >([]);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<ActionFormValues>();

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [actionsRes, itemsRes, optionsRes] = await Promise.all([
        apiOpenItems.getAllBoxActions(),
        apiItems.getAll(),
        apiOptions.getAll(),
      ]);
      setActions(actionsRes.payload.data || []);
      setItemsTemplate(itemsRes.payload?.data || []);
      setOptionsTemplate(optionsRes.payload?.data || []);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      messageApi.error("Không thể tải dữ liệu khởi tạo!");
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const debouncedSearch = useCallback(
    debounce((value: string) => setSearch(value), 300),
    [],
  );

  const filteredActions = actions.filter(
    (action) =>
      action.item_template.NAME?.toLowerCase().includes(search.toLowerCase()) ||
      action.id.toString().includes(search.toLowerCase()),
  );

  // --- Các hàm xử lý Modal và Form ---

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setSelectedAction(null);
    form.resetFields();
    form.setFieldsValue({
      open_mode: "random",
      box_item_drops: [],
    });
  };

  const handleOpenEditModal = (action: BoxItemAction) => {
    setModalMode("edit");
    setSelectedAction(action);
    form.setFieldsValue({
      template_item_id: action.template_item_id,
      open_mode: action.open_mode,
      box_item_drops: action.box_item_drops.map((drop) => ({
        item_template_id: drop.item_template_id,
        quantity_min: drop.quantity_min,
        quantity_max: drop.quantity_max,
        drop_rate: drop.drop_rate,
        box_item_drop_options: drop.box_item_drop_options.map((opt) => ({
          option_id: opt.option_id,
          option_param: opt.option_param,
        })),
      })),
    });
  };

  const handleFormSubmit = async (values: ActionFormValues) => {
    setSubmitLoading(true);
    try {
      let response;
      if (modalMode === "edit" && selectedAction) {
        response = await apiOpenItems.updateBoxAction(
          selectedAction.id,
          values,
        );
        if (response.status == 200) {
          messageApi.success("Cập nhật hành động thành công!");
        }
      } else if (modalMode === "create") {
        response = await apiOpenItems.createBoxAction(values);
        if (response.status == 201) {
          messageApi.success("Tạo mới hành động thành công!");
        }
      }

      if (response && response.status == 200) {
        handleCancel();
        fetchInitialData();
      } else {
        messageApi.error(response?.payload.message || "Thao tác thất bại!");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      messageApi.error("Có lỗi xảy ra khi gửi dữ liệu!");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    setModalMode(null);
    setSelectedAction(null);
    form.resetFields();
  };

  // --- Các thành phần Render ---

  const expandedRowRender = (record: BoxItemAction) => {
    const dropColumns: ColumnsType<BoxItemDrop> = [
      {
        title: "Vật phẩm rơi ra",
        dataIndex: ["item_template", "NAME"],
        key: "dropName",
        render: (name: string, record) => (
          <Text strong>{name || `ID: ${record.item_template_id}`}</Text>
        ),
      },
      {
        title: "SL Min/Max",
        key: "quantity",
        width: 120,
        align: "center",
        render: (_, record) => (
          <Tag color="geekblue">
            {record.quantity_min} / {record.quantity_max}
          </Tag>
        ),
      },
      {
        title: "Tỷ lệ rơi",
        dataIndex: "drop_rate",
        key: "drop_rate",
        width: 100,
        align: "center",
        render: (rate: number) => <Tag color="green">{rate}%</Tag>,
      },
      {
        title: "Các dòng chỉ số (Options)",
        key: "options",
        dataIndex: "box_item_drop_options",
        render: (options: BoxItemDropOption[]) => (
          <Space wrap>
            {options?.length > 0 ? (
              options.map((opt) => (
                <Tag color="purple" key={opt.id || opt.option_id}>
                  {opt.item_option_template?.NAME || `OptID: ${opt.option_id}`}{" "}
                  (
                  {opt.option_param > 0
                    ? `+${opt.option_param}`
                    : opt.option_param}
                  )
                </Tag>
              ))
            ) : (
              <Text type="secondary">Không có</Text>
            )}
          </Space>
        ),
      },
    ];
    return (
      <Table
        columns={dropColumns}
        dataSource={record.box_item_drops}
        rowKey={(record) => record.id || record.item_template_id} // FIXED: Cần key ổn định
        pagination={false}
        size="small"
      />
    );
  };

  const mainColumns: ColumnsType<BoxItemAction> = [
    { title: "Action ID", dataIndex: "id", key: "id", width: 100 },
    {
      title: "Vật phẩm Yêu cầu",
      dataIndex: ["item_template", "NAME"],
      key: "req_item",
      render: (name, record) => (
        <Space>
          <BoxPlotOutlined />
          <Text strong copyable>
            {name || "N/A"} (ID: {record.template_item_id})
          </Text>
        </Space>
      ),
    },
    {
      title: "Chế độ mở",
      dataIndex: "open_mode",
      key: "open_mode",
      width: 150,
      render: (mode: string) => (
        <Tag color="cyan" style={{ textTransform: "capitalize" }}>
          {mode}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleOpenEditModal(record)}
        >
          Sửa
        </Button>
      ),
    },
  ];
  const searchFilter = (input: string, option: any) =>
    (option?.children ?? "")
      .toString()
      .toLowerCase()
      .includes(input.toLowerCase());

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} lg={12}>
              <Space align="center">
                <GiftOutlined style={{ fontSize: 32, color: "#1890ff" }} />
                <div>
                  <Title level={3} style={{ margin: 0 }}>
                    Quản lý Rương & Vật phẩm rơi
                  </Title>
                  <Text type="secondary">
                    Xem, sửa và tạo mới các hành động mở hộp
                  </Text>
                </div>
              </Space>
            </Col>
            <Col xs={24} lg={12}>
              <Row gutter={[16, 16]} justify="end">
                <Col>
                  <Statistic
                    title="Tổng số Hành động"
                    value={actions.length}
                    prefix={<ApartmentOutlined />}
                  />
                </Col>
                {/* ADDED: Nút tạo mới */}
                <Col>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={handleOpenCreateModal}
                  >
                    Tạo mới Action
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>

        <Card>
          <Search
            placeholder="Tìm kiếm theo ID hoặc tên vật phẩm..."
            allowClear
            enterButton
            size="large"
            onChange={(e) => debouncedSearch(e.target.value)}
            style={{ marginBottom: 20, maxWidth: 400 }}
          />
          <Table
            columns={mainColumns}
            dataSource={filteredActions}
            rowKey="id"
            loading={loading}
            expandable={{ expandedRowRender }}
            scroll={{ x: 1200 }}
            bordered
          />
        </Card>
      </Space>

      {/* --- Modal Đa năng cho Tạo mới và Chỉnh sửa --- */}
      <Modal
        title={
          modalMode === "edit"
            ? `Chỉnh sửa Hành động: ${selectedAction?.item_template.NAME || ""}`
            : "Tạo mới Hành động Mở hộp"
        }
        open={!!modalMode} // Mở khi modalMode có giá trị
        onCancel={handleCancel}
        footer={null}
        width={1200}
        destroyOnClose // Hủy các state của form khi đóng modal
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="template_item_id"
                label="Vật phẩm Yêu cầu"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn vật phẩm yêu cầu!",
                  },
                ]}
              >
                <Select
                  showSearch
                  filterOption={searchFilter}
                  placeholder="Chọn vật phẩm chính"
                >
                  {itemsTemplate.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.NAME} (ID: {item.id})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="open_mode"
                label="Chế độ mở"
                rules={[
                  { required: true, message: "Vui lòng chọn chế độ mở!" },
                ]}
              >
                <Select>
                  <Option value="random">
                    Random (Ngẫu nhiên 1 trong các vật phẩm)
                  </Option>
                  <Option value="fixed">All (Tất cả vật phẩm)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Title level={5}>Danh sách Vật phẩm rơi ra</Title>

          {/* --- Form.List cho các vật phẩm rơi (Drops) --- */}
          <Form.List name="box_item_drops">
            {(fields, { add, remove }) => (
              <div
                style={{ display: "flex", flexDirection: "column", rowGap: 16 }}
              >
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    size="small"
                    key={key}
                    title={`Vật phẩm rơi #${name + 1}`}
                    extra={<MinusCircleOutlined onClick={() => remove(name)} />}
                  >
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          {...restField}
                          name={[name, "item_template_id"]}
                          label="Vật phẩm"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn vật phẩm!",
                            },
                          ]}
                        >
                          <Select
                            showSearch
                            filterOption={searchFilter}
                            placeholder="Chọn vật phẩm rơi ra"
                          >
                            {itemsTemplate.map((item) => (
                              <Option key={item.id} value={item.id}>
                                {item.NAME} (ID: {item.id})
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8} lg={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "quantity_min"]}
                          label="SL Min"
                          initialValue={1}
                          rules={[{ required: true, message: "Nhập SL!" }]}
                        >
                          <InputNumber style={{ width: "100%" }} min={1} />
                        </Form.Item>
                      </Col>
                      <Col span={8} lg={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "quantity_max"]}
                          label="SL Max"
                          initialValue={1}
                          rules={[{ required: true, message: "Nhập SL!" }]}
                        >
                          <InputNumber style={{ width: "100%" }} min={1} />
                        </Form.Item>
                      </Col>
                      <Col span={8} lg={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "drop_rate"]}
                          label="Tỷ lệ rơi (%)"
                          initialValue={100}
                          rules={[{ required: true, message: "Nhập tỷ lệ!" }]}
                        >
                          <InputNumber
                            style={{ width: "100%" }}
                            min={0}
                            max={100}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* --- Form.List lồng bên trong cho Options --- */}
                    <Form.List name={[name, "box_item_drop_options"]}>
                      {(optFields, { add: addOpt, remove: removeOpt }) => (
                        <div
                          style={{
                            padding: "12px",
                            background: "#fafafa",
                            borderRadius: "8px",
                            marginTop: "12px",
                          }}
                        >
                          {optFields.map(
                            ({
                              key: optKey,
                              name: optName,
                              ...restOptField
                            }) => (
                              <Space
                                key={optKey}
                                style={{ display: "flex", marginBottom: 8 }}
                                align="baseline"
                              >
                                <Form.Item
                                  {...restOptField}
                                  name={[optName, "option_id"]}
                                  rules={[
                                    { required: true, message: "Thiếu option" },
                                  ]}
                                  style={{ flex: 1 }}
                                >
                                  <Select
                                    showSearch
                                    filterOption={searchFilter}
                                    placeholder="Chọn chỉ số"
                                  >
                                    {optionsTemplate.map((opt) => (
                                      <Option key={opt.id} value={opt.id}>
                                        {opt.NAME}
                                      </Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                                <Form.Item
                                  {...restOptField}
                                  name={[optName, "option_param"]}
                                  rules={[
                                    { required: true, message: "Thiếu param" },
                                  ]}
                                >
                                  <InputNumber placeholder="Tham số" />
                                </Form.Item>
                                <MinusCircleOutlined
                                  onClick={() => removeOpt(optName)}
                                />
                              </Space>
                            ),
                          )}
                          <Button
                            type="dashed"
                            onClick={() => addOpt()}
                            block
                            icon={<PlusOutlined />}
                          >
                            Thêm Chỉ số (Option)
                          </Button>
                        </div>
                      )}
                    </Form.List>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  // ADDED: Thêm giá trị mặc định khi thêm vật phẩm mới
                  onClick={() =>
                    add({
                      quantity_min: 1,
                      quantity_max: 1,
                      drop_rate: 100,
                      box_item_drop_options: [],
                    })
                  }
                  block
                  icon={<PlusOutlined />}
                >
                  Thêm Vật phẩm rơi
                </Button>
              </div>
            )}
          </Form.List>

          <Form.Item style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submitLoading}>
                {/* CHANGED: Text của nút thay đổi theo mode */}
                {modalMode === "edit" ? "Lưu thay đổi" : "Tạo Action"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BoxActionManagementPage;
