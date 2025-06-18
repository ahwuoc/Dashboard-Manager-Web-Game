//types.tsx
export interface RewardItem {
  id: number;
  label: string;
  value: string;
  icon: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic";
  revealed: boolean;
  color: string;
}

// Định nghĩa một interface mở rộng cho server, có thêm 'weight'
export interface ServerRewardItem extends RewardItem {
  weight: number;
}
