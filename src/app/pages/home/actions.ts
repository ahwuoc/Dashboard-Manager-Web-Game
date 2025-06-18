// app/actions.ts
"use server";

// Dựa trên các đoạn code trước, RewardItem interface được định nghĩa trong GridSpinWheel.tsx
// Nếu RewardItem của bạn được định nghĩa ở một file chung khác (ví dụ: types/index.ts), hãy chỉnh lại đường dẫn
import { RewardItem as ClientRewardItem } from "./page";

// Định nghĩa lại RewardItem với thuộc tính weight cho server-side
interface ServerRewardItem extends ClientRewardItem {
  weight: number;
}

// Đây là data gốc của bạn, CÙNG VỚI TRỌNG SỐ (WEIGHTS)
// Cần được định nghĩa TẠI ĐÂY (trên server) để đảm bảo tính toàn vẹn.
// KHÔNG BAO GIỜ LẤY TRỌNG SỐ HOẶC DATA NÀY TRỰC TIẾP TỪ CLIENT!
const SERVER_SIDE_WEIGHTED_REWARDS: ServerRewardItem[] = [
  {
    id: 1,
    label: "Thỏi vàng",
    value: "Random 1-100 thỏi",
    color: "#4A90E2", // Blue
    icon: "http://103.78.0.42/public/icon/4028.png",
    rarity: "Rare",
    revealed: false,
    weight: 10, // Ví dụ: Rare có trọng số 10
  },
  {
    id: 2,
    label: "Bông Tai Cấp 5",
    value: "x1",
    color: "#F5A623", // Orange
    icon: "http://103.78.0.42/public/icon/7993.png",
    rarity: "Common",
    revealed: false,
    weight: 50, // Ví dụ: Common có trọng số 50 (cơ hội cao hơn)
  },
  {
    id: 3,
    label: "Cải Trang Mega Broly",
    value: "x1",
    color: "#D0021B", // Red
    icon: "http://103.78.0.42/public/icon/17548.png",
    rarity: "Epic",
    revealed: false,
    weight: 8, // Ví dụ: Epic có trọng số 8
  },
  {
    id: 4,
    label: "Cảm ơn bạn đã tham gia",
    value: "Cảm ơn",
    color: "#7ED321", // Green
    icon: "🎉",
    rarity: "Common",
    revealed: false,
    weight: 60, // Ví dụ: Common (Cảm ơn) có trọng số 60 (rất hay ra)
  },
  {
    id: 5,
    label: "Ván bay Mây Mưa",
    value: "x1",
    color: "#50E3C2", // Cyan/Turquoise
    icon: "http://103.78.0.42/public/icon/18067.png",
    rarity: "Uncommon",
    revealed: false,
    weight: 20, // Ví dụ: Uncommon có trọng số 20
  },
  {
    id: 6,
    label: "Cải trang Goku Rose VIP",
    value: "x1",
    color: "#F8E71C", // Yellow
    icon: "http://103.78.0.42/public/icon/18044.png",
    rarity: "Legendary",
    revealed: false,
    weight: 2, // Ví dụ: Legendary có trọng số 2 (rất hiếm)
  },
  {
    id: 7,
    label: "Đá Quý Huyền Thoại",
    value: "x1",
    color: "#9013FE", // Purple
    icon: "🔥",
    rarity: "Mythic",
    revealed: false,
    weight: 1, // Ví dụ: Mythic có trọng số 1 (hiếm nhất)
  },
  {
    id: 8,
    label: "Danh Hiệu Trùm Săn Boss",
    value: "x1",
    color: "#FF6B35", // Orange-Red
    icon: "http://103.78.0.42/public/icon/18248.png",
    rarity: "Rare",
    revealed: false,
    weight: 15, // Ví dụ: Rare khác có trọng số 15
  },
  // Mục có value "Spin" (id: 9) sẽ không được đưa vào SERVER_SIDE_WEIGHTED_REWARDS
  // vì nó không phải là một phần thưởng có thể quay ra.
  // Nó chỉ là placeholder cho nút bấm trên client.
];

// Hàm Server Action để xử lý việc quay thưởng
export async function spinWheelAction(): Promise<{
  success: boolean;
  winner?: ClientRewardItem; // Trả về RewardItem không có weight cho client
  error?: string;
}> {
  // Thực hiện các kiểm tra nghiệp vụ tại đây (ví dụ: người dùng còn lượt quay không?)
  // Đây là nơi bạn sẽ tương tác với database, xác thực user, v.v.
  // const userId = getUserIdFromSession(); // Ví dụ lấy user ID từ session (cần cài đặt authentication)
  // if (!userId) {
  //   return { success: false, error: "Người dùng chưa đăng nhập." };
  // }
  // const userSpins = await getUserSpins(userId); // Giả định hàm này lấy số lượt quay còn lại của user
  // if (userSpins <= 0) {
  //   return { success: false, error: "Bạn đã hết lượt quay!" };
  // }

  try {
    const prizePool = SERVER_SIDE_WEIGHTED_REWARDS; // Dùng trực tiếp mảng đã có trọng số

    if (prizePool.length === 0) {
      return { success: false, error: "Không có phần thưởng nào để quay." };
    }

    // --- Logic chọn phần thưởng theo trọng số ---
    const totalWeight = prizePool.reduce((sum, item) => sum + item.weight, 0);

    // Chọn một số ngẫu nhiên từ 0 đến totalWeight
    const randomNumber = Math.random() * totalWeight;

    let winningItem: ServerRewardItem | undefined;
    let currentWeight = 0;

    // Duyệt qua các phần thưởng để tìm ra phần thưởng thắng cuộc
    for (const item of prizePool) {
      currentWeight += item.weight;
      if (randomNumber < currentWeight) {
        winningItem = item;
        break;
      }
    }

    if (!winningItem) {
      // Fallback nếu có lỗi xảy ra (thường không nên xảy ra nếu trọng số > 0)
      console.warn("Weighted selection failed, falling back to random pick.");
      winningItem = prizePool[Math.floor(Math.random() * prizePool.length)];
    }

    // --- Kết thúc logic chọn phần thưởng ---

    // Ghi lại lịch sử quay vào database (ví dụ)
    // Cần cài đặt kết nối database và các hàm tương tác tại đây
    // await saveSpinResultToDatabase(userId, winningItem.id);
    // await decrementUserSpins(userId); // Giảm lượt quay của người dùng

    // Trả về phần thưởng thắng cuộc cho client
    // Đảm bảo chỉ trả về các thuộc tính mà client cần (không cần weight)
    const clientWinner: ClientRewardItem = {
      id: winningItem.id,
      label: winningItem.label,
      value: winningItem.value,
      icon: winningItem.icon,
      rarity: winningItem.rarity,
      color: winningItem.color,
      revealed: false, // Client sẽ tự handle trạng thái revealed
    };

    return { success: true, winner: clientWinner };
  } catch (err) {
    console.error("Lỗi khi xử lý quay thưởng:", err);
    return { success: false, error: "Đã xảy ra lỗi hệ thống khi quay thưởng." };
  }
}

// Hàm Server Action để lấy lịch sử (nếu bạn muốn load từ DB)
export async function getSpinHistoryAction(): Promise<ClientRewardItem[]> {
  // Đây là nơi bạn sẽ load lịch sử từ database cho user cụ thể
  // Ví dụ: const userId = getUserIdFromSession();
  // if (!userId) return [];
  // const history = await loadUserSpinHistoryFromDatabase(userId);
  // return history.map(item => ({...item, revealed: false})); // Đảm bảo format phù hợp
  //
  // Tạm thời trả về mảng rỗng để minh họa
  return [];
}
