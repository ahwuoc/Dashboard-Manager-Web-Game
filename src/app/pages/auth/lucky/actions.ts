// app/actions.ts
"use server"; // Dòng này đảm bảo tất cả các export trong file này chỉ chạy trên server

import { RewardItem, ServerRewardItem } from "./types"; // Import từ file types mới

// Tùy chọn: Để đảm bảo file này không bao giờ bị bundle vào client
import "server-only";

// Dữ liệu phần thưởng CÙNG VỚI TRỌNG SỐ (WEIGHTS)
// Đây là nguồn duy nhất, đáng tin cậy cho dữ liệu phần thưởng của bạn.
// Tuyệt đối KHÔNG BAO GIỜ để client gửi dữ liệu trọng số (weight) hoặc tự xác định phần thưởng.
const SERVER_SIDE_WEIGHTED_REWARDS: ServerRewardItem[] = [
  {
    id: 1,
    label: "Thỏi vàng",
    value: "Random 1-100 thỏi",
    color: "#4A90E2",
    icon: "http://103.78.0.42/public/icon/4028.png",
    rarity: "Rare",
    revealed: false,
    weight: 10,
  },
  {
    id: 2,
    label: "Bông Tai Cấp 5",
    value: "x1",
    color: "#F5A623",
    icon: "http://103.78.0.42/public/icon/7993.png",
    rarity: "Common",
    revealed: false,
    weight: 50,
  },
  {
    id: 3,
    label: "Cải Trang Mega Broly",
    value: "x1",
    color: "#D0021B",
    icon: "http://103.78.0.42/public/icon/17548.png",
    rarity: "Epic",
    revealed: false,
    weight: 8,
  },
  {
    id: 4,
    label: "Cảm ơn bạn đã tham gia",
    value: "Cảm ơn",
    color: "#7ED321",
    icon: "🎉",
    rarity: "Common",
    revealed: false,
    weight: 60,
  },
  {
    id: 5,
    label: "Ván bay Mây Mưa",
    value: "x1",
    color: "#50E3C2",
    icon: "http://103.78.0.42/public/icon/18067.png",
    rarity: "Uncommon",
    revealed: false,
    weight: 20,
  },
  {
    id: 6,
    label: "Cải trang Goku Rose VIP",
    value: "x1",
    color: "#F8E71C",
    icon: "http://103.78.0.42/public/icon/18044.png",
    rarity: "Legendary",
    revealed: false,
    weight: 2,
  },
  {
    id: 7,
    label: "Đá Quý Huyền Thoại",
    value: "x1",
    color: "#9013FE",
    icon: "🔥",
    rarity: "Mythic",
    revealed: false,
    weight: 1,
  },
  {
    id: 8,
    label: "Danh Hiệu Trùm Săn Boss",
    value: "x1",
    color: "#FF6B35",
    icon: "http://103.78.0.42/public/icon/18248.png",
    rarity: "Rare",
    revealed: false,
    weight: 15,
  },
];

/**
 * Lựa chọn một phần thưởng dựa trên trọng số đã định nghĩa.
 * @returns {RewardItem} Phần thưởng thắng cuộc.
 * @throws {Error} Nếu không có phần thưởng nào để quay.
 */
function selectWeightedReward(): RewardItem {
  const prizePool = SERVER_SIDE_WEIGHTED_REWARDS;

  if (prizePool.length === 0) {
    throw new Error("Không có phần thưởng nào để quay.");
  }

  const totalWeight = prizePool.reduce((sum, item) => sum + item.weight, 0);
  const randomNumber = Math.random() * totalWeight;

  let winningItem: ServerRewardItem | undefined;
  let currentWeight = 0;

  for (const item of prizePool) {
    currentWeight += item.weight;
    if (randomNumber < currentWeight) {
      winningItem = item;
      break;
    }
  }

  // Fallback an toàn nếu có lỗi trong logic trọng số (thường không xảy ra)
  if (!winningItem) {
    console.warn("Weighted selection failed, falling back to random pick.");
    winningItem = prizePool[Math.floor(Math.random() * prizePool.length)];
  }

  // Trả về RewardItem chuẩn (không có weight) cho client
  const { weight, ...clientRewardItem } = winningItem;
  return clientRewardItem;
}

/**
 * Server Action để xử lý việc quay thưởng.
 * Thực hiện logic nghiệp vụ, chọn phần thưởng và mô phỏng lưu lịch sử.
 * @returns {Promise<{ success: boolean; winner?: RewardItem; error?: string; }>} Kết quả quay thưởng.
 */
export async function spinWheelAction(): Promise<{
  success: boolean;
  winner?: RewardItem;
  error?: string;
}> {
  // --- VIẾT LOGIC XÁC THỰC VÀ TƯƠNG TÁC DB TẠI ĐÂY ---
  // Ví dụ:
  // const session = await getSession(); // Lấy session người dùng
  // if (!session?.user) {
  //   return { success: false, error: "Bạn cần đăng nhập để quay thưởng." };
  // }
  //
  // const user = await getUserData(session.user.id); // Lấy thông tin user từ DB
  // if (user.spinsRemaining <= 0) {
  //   return { success: false, error: "Bạn đã hết lượt quay!" };
  // }
  //
  // await decrementUserSpinCount(user.id); // Giảm số lượt quay của user trong DB
  // --- KẾT THÚC LOGIC XÁC THỰC VÀ TƯƠNG TÁC DB ---

  try {
    const winningItem = selectWeightedReward();

    // Mô phỏng độ trễ mạng để thấy hiệu ứng tải
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Ở đây bạn có thể lưu winningItem vào database lịch sử của người dùng
    // await saveSpinResultToDatabase(session.user.id, winningItem);

    return { success: true, winner: winningItem };
  } catch (error) {
    console.error("Lỗi khi xử lý quay thưởng:", error);
    // Xử lý lỗi cụ thể (ví dụ: database down, logic chọn phần thưởng lỗi)
    return { success: false, error: "Đã xảy ra lỗi hệ thống khi quay thưởng." };
  }
}

/**
 * Server Action để lấy lịch sử quay thưởng của người dùng.
 * @returns {Promise<RewardItem[]>} Danh sách các phần thưởng đã quay.
 */
export async function getSpinHistoryAction(): Promise<RewardItem[]> {
  // --- VIẾT LOGIC XÁC THỰC VÀ LẤY LỊCH SỬ TỪ DB TẠI ĐÂY ---
  // Ví dụ:
  // const session = await getSession();
  // if (!session?.user) {
  //   return [];
  // }
  // const history = await loadUserSpinHistoryFromDatabase(session.user.id);
  // return history.map(item => ({ ...item, revealed: false })); // Đảm bảo format phù hợp cho client
  // --- KẾT THÚC LOGIC XÁC THỰC VÀ LẤY LỊCH SỬ TỪ DB ---

  // Tạm thời trả về mảng rỗng để minh họa
  // Trong ứng dụng thực tế, bạn sẽ lấy từ DB.
  // Ví dụ: return [{ id: 1, label: "Thỏi vàng", value: "Random 1-100 thỏi", color: "#4A90E2", icon: "http://103.78.0.42/public/icon/4028.png", rarity: "Rare", revealed: false }];
  return [];
}
