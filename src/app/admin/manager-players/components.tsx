"use client";

import React from "react";
import { Space, Typography, Tag, Button, List } from "antd";
import { HeartFilled, ThunderboltFilled } from "@ant-design/icons";
import { parseJson } from "./utils";
import type { item_template, item_option_template } from "@/generated/prisma";

const { Text } = Typography;

export const DataPointCell = ({
  data,
  onViewDetail,
}: {
  data?: string | null;
  onViewDetail: () => void;
}) => {
  if (!data) return <Text type="secondary">N/A</Text>;
  return (
    <Button type="link" size="small" onClick={onViewDetail}>
      Xem
    </Button>
  );
};

export const InventoryCell = ({ data }: { data?: string | null }) => {
  const inventory = parseJson<number[]>(data);
  if (!inventory) return <Text type="secondary">N/A</Text>;

  const gold = inventory[0]?.toLocaleString() || "N/A";
  const gem = inventory[1]?.toLocaleString() || "N/A";
  const ruby = inventory[2]?.toLocaleString() || "N/A";

  return (
    <Space direction="vertical" size="small" align="start">
      <Text>
        <HeartFilled style={{ color: "gold" }} /> Vàng:{" "}
        <Text strong>{gold}</Text>
      </Text>
      <Text>
        <ThunderboltFilled style={{ color: "cyan" }} /> Ngọc Xanh:{" "}
        <Text strong>{gem}</Text>
      </Text>
      <Text>
        <HeartFilled style={{ color: "#eb2f96" }} /> Ngọc Hồng:{" "}
        <Text strong>{ruby}</Text>
      </Text>
    </Space>
  );
};
import { parseItemsData } from "./utils";
export const TaskCell = ({ data }: { data?: string | null }) => {
  const task = parseJson<number[]>(data);
  if (!task) return <Text type="secondary">N/A</Text>;
  const mainTaskId = task[0];
  const progress = task[1];
  return (
    <Text>
      {mainTaskId === -1 ? "Đã xong" : `NV ${mainTaskId} (${progress})`}
    </Text>
  );
};

export const ItemsContainerCell = ({
  data,
  onViewDetail,
}: {
  data?: string | null;
  onViewDetail: () => void;
}) => {
  const items = parseItemsData(data);
  if (!items || items.length === 0) {
    return <Tag>Trống</Tag>;
  }
  return (
    <Button type="link" size="small" onClick={onViewDetail}>
      {`${items.length} món`}
    </Button>
  );
};

// COMPONENT QUAN TRỌNG: Nhận "từ điển" từ cha để hiển thị đúng tên
export const ItemDetailContent = ({
  items,
  itemTemplateMap,
  optionTemplateMap,
}: {
  items: { id: number; quantity: number; options: unknown[]; expiry: number }[];
  itemTemplateMap: Map<number, item_template>;
  optionTemplateMap: Map<number, item_option_template>;
}) => {
  // Hàm nội bộ để format chỉ số
  const formatOption = (name: string, param: number) => {
    return name.replace("#", param.toString());
  };

  return (
    <List
      size="small"
      bordered
      dataSource={items}
      renderItem={(item) => {
        const template = itemTemplateMap.get(item.id);
        const itemName = template ? template.NAME : "Vật phẩm lạ";

        return (
          <List.Item>
            <List.Item.Meta
              avatar={<Tag color="volcano">{item.id}</Tag>}
              title={<Text strong>{itemName}</Text>}
              description={
                <Space
                  direction="vertical"
                  size="small"
                  style={{ marginTop: 4 }}
                >
                  <Text type="secondary">Số lượng: {item.quantity}</Text>
                  <div>
                    {item.options.map((optionStr, idx) => {
                      const optionArr = parseJson<[number, number]>(
                        optionStr as any,
                      );
                      if (!optionArr) return null;

                      const [optionId, param] = optionArr;
                      const optionTemplate = optionTemplateMap.get(optionId);

                      return (
                        <Tag key={idx} color="geekblue">
                          {optionTemplate
                            ? formatOption(optionTemplate.NAME, param)
                            : `Option ${optionId}: ${param}`}
                        </Tag>
                      );
                    })}
                  </div>
                </Space>
              }
            />
          </List.Item>
        );
      }}
    />
  );
};
