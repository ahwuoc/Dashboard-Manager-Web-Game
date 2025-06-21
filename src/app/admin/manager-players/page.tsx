"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Card,
  Input,
  Space,
  Typography,
  message,
  Tag,
  Row,
  Col,
  Statistic,
  Modal,
  Descriptions,
  Button,
} from "antd";
import { TeamOutlined } from "@ant-design/icons";
import { apiPlayers } from "@/app/handler/apiPlayers";
import { apiItems } from "@/app/handler/apiItems";
import { apiOptions } from "@/app/handler/apiOptions";
import type {
  player,
  item_template,
  item_option_template,
} from "@/generated/prisma";
import type { ColumnsType } from "antd/es/table";
import { useDebounce } from "./hooks";
import {
  TaskCell,
  InventoryCell,
  DataPointCell,
  ItemsContainerCell,
  ItemDetailContent,
} from "./components";
import { parseJson, parseItemsData } from "./utils";

const { Title, Text } = Typography;
const { Search } = Input;

export default function PlayersManagementPage() {
  const [players, setPlayers] = useState<player[]>([]);
  const [itemTemplates, setItemTemplates] = useState<item_template[]>([]);
  const [optionTemplates, setOptionTemplates] = useState<
    item_option_template[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    content: React.ReactNode;
  } | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [playerRes, itemRes, optionRes] = await Promise.all([
          apiPlayers.getAll(),
          apiItems.getAll(),
          apiOptions.getAll(),
        ]);

        if (playerRes.payload?.data) {
          // DÒNG QUAN TRỌNG NHẤT: PHẢI LUÔN GÁN `response.payload.data` ĐỂ STATE LÀ MỘT MẢNG (ARRAY)
          setPlayers(playerRes.payload.data);
        }
        if (itemRes.payload?.data) setItemTemplates(itemRes.payload.data);
        if (optionRes.payload?.data) setOptionTemplates(optionRes.payload.data);
      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu tổng hợp:", error);
        messageApi.error("Không thể tải dữ liệu của trang");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [messageApi]);

  // Từ điển tra cứu, chỉ tạo lại khi data thay đổi
  const itemTemplateMap = useMemo(
    () => new Map(itemTemplates.map((item) => [item.id, item])),
    [itemTemplates],
  );
  const optionTemplateMap = useMemo(
    () => new Map(optionTemplates.map((option) => [option.id, option])),
    [optionTemplates],
  );

  const filteredPlayers = useMemo(() => {
    if (!debouncedSearchTerm) return players;
    return players.filter(
      (player) =>
        player.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        player.id.toString().includes(debouncedSearchTerm),
    );
  }, [players, debouncedSearchTerm]);

  const showDetailModal = (title: string, content: React.ReactNode) => {
    setModalContent({ title, content });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

  const handleViewDataPoint = (record: player) => {
    const points = parseJson<number[]>(record.data_point);
    const content = (
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Sức mạnh">
          {points?.[1]?.toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Tiềm năng">
          {points?.[2]?.toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Thể lực">
          {points?.[3]?.toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="HP gốc">
          {points?.[4]?.toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="KI gốc">
          {points?.[5]?.toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="SĐ gốc">
          {points?.[6]?.toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Giáp">
          {points?.[7]?.toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Chí mạng">
          {points?.[8]?.toLocaleString()}%
        </Descriptions.Item>
      </Descriptions>
    );
    showDetailModal(`Chỉ số của ${record.name}`, content);
  };

  const handleViewItems = (
    record: player,
    dataKey: keyof player,
    title: string,
  ) => {
    const items = parseItemsData(record[dataKey] as string);
    const content = (
      <ItemDetailContent
        items={items}
        itemTemplateMap={itemTemplateMap}
        optionTemplateMap={optionTemplateMap}
      />
    );
    showDetailModal(`Chi tiết ${title} của ${record.name}`, content);
  };

  const columns: ColumnsType<player> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
      width: 80,
      render: (id) => <Text code>{id}</Text>,
    },
    {
      title: "Tên nhân vật",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: "Hành tinh",
      dataIndex: "gender",
      key: "gender",
      width: 120,
      filters: [
        { text: "Trái Đất", value: 0 },
        { text: "Namếc", value: 1 },
        { text: "Xayda", value: 2 },
      ],
      onFilter: (value, record) => record.gender === value,
      render: (gender: number) => {
        if (gender === 0) return <Tag color="green">Trái Đất</Tag>;
        if (gender === 1) return <Tag color="blue">Namếc</Tag>;
        if (gender === 2) return <Tag color="red">Xayda</Tag>;
        return <Tag>Không rõ</Tag>;
      },
    },
    {
      title: "Tài sản",
      dataIndex: "data_inventory",
      key: "data_inventory",
      width: 200,
      render: (data) => <InventoryCell data={data} />,
    },
    {
      title: "Chỉ số",
      dataIndex: "data_point",
      key: "data_point",
      width: 120,
      render: (data, record) => (
        <DataPointCell
          data={data}
          onViewDetail={() => handleViewDataPoint(record)}
        />
      ),
    },
    {
      title: "Nhiệm vụ",
      dataIndex: "data_side_task",
      key: "data_side_task",
      width: 150,
      render: (data) => <TaskCell data={data} />,
    },
    {
      title: "Trang bị",
      dataIndex: "items_body",
      key: "items_body",
      width: 120,
      render: (data, record) => (
        <ItemsContainerCell
          data={data}
          onViewDetail={() => handleViewItems(record, "items_body", "Trang bị")}
        />
      ),
    },
    {
      title: "Hành trang",
      dataIndex: "items_bag",
      key: "items_bag",
      width: 120,
      render: (data, record) => (
        <ItemsContainerCell
          data={data}
          onViewDetail={() =>
            handleViewItems(record, "items_bag", "Hành trang")
          }
        />
      ),
    },
    {
      title: "Rương đồ",
      dataIndex: "items_box",
      key: "items_box",
      width: 120,
      render: (data, record) => (
        <ItemsContainerCell
          data={data}
          onViewDetail={() => handleViewItems(record, "items_box", "Rương đồ")}
        />
      ),
    },
  ];

  const totalPlayers = players.length;
  const earthPlayers = players.filter((p) => p.gender === 0).length;
  const namekPlayers = players.filter((p) => p.gender === 1).length;
  const saiyanPlayers = players.filter((p) => p.gender === 2).length;

  return (
    <div style={{ padding: "24px" }}>
      {contextHolder}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12}>
            <Space align="center">
              <TeamOutlined style={{ fontSize: "32px", color: "#1890ff" }} />
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  Quản lý Nhân vật
                </Title>
                <Text type="secondary">
                  Hiển thị thông tin các nhân vật trong game
                </Text>
              </div>
            </Space>
          </Col>
          <Col xs={24} sm={12}>
            <Row gutter={[16, 16]}>
              <Col flex="1">
                <Statistic title="Tổng nhân vật" value={totalPlayers} />
              </Col>
              <Col flex="1">
                <Statistic
                  title="Trái Đất"
                  value={earthPlayers}
                  valueStyle={{ color: "#389e0d" }}
                />
              </Col>
              <Col flex="1">
                <Statistic
                  title="Namếc"
                  value={namekPlayers}
                  valueStyle={{ color: "#1677ff" }}
                />
              </Col>
              <Col flex="1">
                <Statistic
                  title="Xayda"
                  value={saiyanPlayers}
                  valueStyle={{ color: "#cf1322" }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <Card>
        <div style={{ marginBottom: "16px" }}>
          <Search
            placeholder="Tìm theo ID hoặc tên nhân vật..."
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
          dataSource={filteredPlayers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} nhân vật`,
          }}
          scroll={{ x: 1600 }}
          size="middle"
          bordered
          locale={{
            emptyText: (
              <Text type="secondary">Không tìm thấy nhân vật nào.</Text>
            ),
          }}
        />
      </Card>

      <Modal
        title={modalContent?.title}
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={<Button onClick={handleModalClose}>Đóng</Button>}
        width={600}
      >
        {modalContent?.content}
      </Modal>
    </div>
  );
}
