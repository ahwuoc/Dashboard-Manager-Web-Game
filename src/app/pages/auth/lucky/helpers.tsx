import { RewardItem } from "./types";
export const getRarityBackground = (rarity: string) => {
  switch (rarity) {
    case "Mythic":
      return "from-purple-800 to-fuchsia-900";
    case "Legendary":
      return "from-yellow-500 to-orange-600";
    case "Epic":
      return "from-red-600 to-rose-700";
    case "Rare":
      return "from-blue-600 to-cyan-700";
    case "Uncommon":
      return "from-emerald-500 to-teal-600";
    default:
      return "from-gray-500 to-gray-700";
  }
};

export const renderIcon = (item: RewardItem, isActive: boolean) => {
  const opacityClass =
    !item.revealed && isActive && item.value !== "SpinButton"
      ? "opacity-100"
      : "opacity-90";

  if (item.icon.startsWith("http")) {
    return (
      <img
        src={item.icon}
        alt="Icon"
        className={`w-16 h-16 md:w-20 md:h-20 object-contain mx-auto mb-2 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-opacity duration-200 ${opacityClass}`}
      />
    );
  }
  return (
    <span
      className={`text-5xl md:text-6xl mx-auto mb-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-opacity duration-200 ${opacityClass}`}
    >
      {item.icon}
    </span>
  );
};
