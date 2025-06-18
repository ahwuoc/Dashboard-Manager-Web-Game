// // app/components/GridSpinWheel.tsx
// "use client";

// import React, { useState, useRef, useEffect, useCallback } from "react";
// import type { JSX } from "react"; // <--- Thêm dòng này để định nghĩa JSX namespace
// import { motion, AnimatePresence } from "framer-motion";
// import { spinWheelAction, getSpinHistoryAction } from "./actions";
// export interface RewardItem {
//   id: number;
//   label: string;
//   value: string;
//   icon: string;
//   rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic";
//   revealed: boolean;
//   color: string;
// }

// interface HistoryModalProps {
//   spinHistory: RewardItem[];
//   onClose: () => void;
//   onClearHistory: () => void;
//   renderIcon: (item: RewardItem, isActive: boolean) => JSX.Element;
// }

// const HistoryModal: React.FC<HistoryModalProps> = ({
//   spinHistory,
//   onClose,
//   onClearHistory,
//   renderIcon,
// }) => {
//   return (
//     <motion.div
//       className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       onClick={onClose}
//     >
//       <motion.div
//         className="bg-gray-900 rounded-lg shadow-xl border border-gray-700 w-full max-w-md p-6 relative"
//         initial={{ y: -50, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         exit={{ y: 50, opacity: 0 }}
//         transition={{ type: "spring", stiffness: 300, damping: 25 }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <button
//           onClick={onClose}
//           className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold transition-colors"
//         >
//           &times;
//         </button>
//         <h3 className="text-2xl font-bold text-yellow-400 mb-4 text-center flex items-center justify-center">
//           <span className="mr-2">📜</span> LỊCH SỬ QUAY CỦA TÔI
//           <span className="ml-2">📜</span>
//         </h3>
//         {spinHistory.length === 0 ? (
//           <p className="text-center text-gray-400 mt-8 mb-8">
//             Chưa có phần thưởng nào được quay. Hãy thử vận may!
//           </p>
//         ) : (
//           <>
//             <div className="max-h-80 overflow-y-auto custom-scrollbar pr-2">
//               {spinHistory
//                 .slice()
//                 .reverse()
//                 .map((item, histIndex) => (
//                   <motion.div
//                     key={`history-${item.id}-${histIndex}`}
//                     className={`flex items-center justify-between p-3 my-2 rounded-lg border border-white/10 transition-all duration-300
//                                 ${
//                                   histIndex === 0 && !item.revealed
//                                     ? "bg-gradient-to-r from-lime-700/30 to-blue-700/30 animate-pulse-fade shadow-lg"
//                                     : "bg-white/5"
//                                 }`}
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.3 }}
//                   >
//                     <div className="flex items-center">
//                       {renderIcon(item, false)}
//                       <span className="ml-3 text-base md:text-lg font-medium text-white">
//                         {item.label}
//                       </span>
//                     </div>
//                     <span
//                       className={`text-xs md:text-sm font-semibold uppercase px-2.5 py-1 rounded-full
//                                         ${
//                                           item.rarity === "Mythic"
//                                             ? "bg-fuchsia-800"
//                                             : item.rarity === "Legendary"
//                                               ? "bg-yellow-700"
//                                               : item.rarity === "Epic"
//                                                 ? "bg-red-700"
//                                                 : item.rarity === "Rare"
//                                                   ? "bg-blue-700"
//                                                   : item.rarity === "Uncommon"
//                                                     ? "bg-emerald-700"
//                                                     : "bg-gray-700"
//                                         }`}
//                     >
//                       {item.rarity}
//                     </span>
//                   </motion.div>
//                 ))}
//             </div>
//             <button
//               onClick={onClearHistory}
//               className="mt-6 w-full px-5 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-base font-semibold transition-colors duration-200 shadow-md hover:shadow-lg"
//             >
//               Xóa Lịch Sử
//             </button>
//           </>
//         )}
//       </motion.div>
//     </motion.div>
//   );
// };

// const GridSpinWheel: React.FC = () => {
//   const originalSegmentsData: RewardItem[] = [
//     {
//       id: 1,
//       label: "Thỏi vàng",
//       value: "Random 1-100 thỏi",
//       color: "#4A90E2",
//       icon: "http://103.78.0.42/public/icon/4028.png",
//       rarity: "Rare",
//       revealed: false,
//     },
//     {
//       id: 2,
//       label: "Bông Tai Cấp 5",
//       value: "x1",
//       color: "#F5A623",
//       icon: "http://103.78.0.42/public/icon/7993.png",
//       rarity: "Common",
//       revealed: false,
//     },
//     {
//       id: 3,
//       label: "Cải Trang Mega Broly",
//       value: "x1",
//       color: "#D0021B",
//       icon: "http://103.78.0.42/public/icon/17548.png",
//       rarity: "Epic",
//       revealed: false,
//     },
//     {
//       id: 4,
//       label: "Cảm ơn bạn đã tham gia",
//       value: "Cảm ơn",
//       color: "#7ED321",
//       icon: "🎉",
//       rarity: "Common",
//       revealed: false,
//     },
//     {
//       id: 5,
//       label: "Ván bay Mây Mưa",
//       value: "x1",
//       color: "#50E3C2",
//       icon: "http://103.78.0.42/public/icon/18067.png",
//       rarity: "Uncommon",
//       revealed: false,
//     },
//     {
//       id: 6,
//       label: "Cải trang Goku Rose VIP",
//       value: "x1",
//       color: "#F8E71C",
//       icon: "http://103.78.0.42/public/icon/18044.png",
//       rarity: "Legendary",
//       revealed: false,
//     },
//     {
//       id: 7,
//       label: "Đá Quý Huyền Thoại",
//       value: "x1",
//       color: "#9013FE",
//       icon: "🔥",
//       rarity: "Mythic",
//       revealed: false,
//     },
//     {
//       id: 8,
//       label: "Danh Hiệu Trùm Săn Boss",
//       value: "x1",
//       color: "#FF6B35",
//       icon: "http://103.78.0.42/public/icon/18248.png",
//       rarity: "Rare",
//       revealed: false,
//     },
//     {
//       id: 9,
//       label: "Nhận để rút thăm",
//       value: "Spin",
//       color: "#FFD700",
//       icon: "🎯",
//       rarity: "Common",
//       revealed: false,
//     },
//   ];

//   const shuffledRewardsRef = useRef(
//     originalSegmentsData
//       .filter((item) => item.value !== "Spin")
//       .sort(() => Math.random() - 0.5),
//   );

//   const [rewards, setRewards] = useState<RewardItem[]>(() => {
//     const arrangedRewards = [...shuffledRewardsRef.current];
//     arrangedRewards.splice(4, 0, {
//       id: 0,
//       label: "Nhấn để rút thăm",
//       value: "SpinButton",
//       icon: "✨",
//       rarity: "Common",
//       revealed: false,
//       color: "#FFD700",
//     });
//     return arrangedRewards;
//   });

//   const [isSpinning, setIsSpinning] = useState(false);
//   const [spinCount, setSpinCount] = useState(0);
//   const availableSpins = Infinity;

//   const [activeCellIndex, setActiveCellIndex] = useState<number | null>(null);
//   const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
//   const currentIntervalSpeedRef = useRef(50);
//   const animationDuration = 4000;
//   const maxIntervalSpeed = 250;

//   const [spinHistory, setSpinHistory] = useState<RewardItem[]>([]);
//   const [showHistoryModal, setShowHistoryModal] = useState(false);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);

//   useEffect(() => {
//     async function loadHistory() {
//       try {
//         const history = await getSpinHistoryAction();
//         setSpinHistory(history);
//       } catch (error) {
//         console.error("Failed to load spin history:", error);
//         setErrorMessage("Không thể tải lịch sử quay. Vui lòng thử lại sau.");
//       }
//     }
//     loadHistory();
//   }, []);

//   const getRarityBackground = (rarity: string) => {
//     switch (rarity) {
//       case "Mythic":
//         return "from-purple-800 to-fuchsia-900";
//       case "Legendary":
//         return "from-yellow-500 to-orange-600";
//       case "Epic":
//         return "from-red-600 to-rose-700";
//       case "Rare":
//         return "from-blue-600 to-cyan-700";
//       case "Uncommon":
//         return "from-emerald-500 to-teal-600";
//       default:
//         return "from-gray-500 to-gray-700";
//     }
//   };

//   const renderIcon = (item: RewardItem, isActive: boolean) => {
//     const opacityClass =
//       !item.revealed && isActive && item.value !== "SpinButton"
//         ? "opacity-100"
//         : "opacity-90";

//     if (item.icon.startsWith("http")) {
//       return (
//         <img
//           src={item.icon}
//           alt="Icon"
//           className={`w-16 h-16 md:w-20 md:h-20 object-contain mx-auto mb-2 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-opacity duration-200 ${opacityClass}`}
//         />
//       );
//     }
//     return (
//       <span
//         className={`text-5xl md:text-6xl mx-auto mb-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-opacity duration-200 ${opacityClass}`}
//       >
//         {item.icon}
//       </span>
//     );
//   };

//   const startSpinAnimation = useCallback(
//     (winningItem: RewardItem) => {
//       let currentIndex = -1;
//       let startTime = Date.now();
//       let localIntervalId: NodeJS.Timeout | null = null;

//       const spinTick = () => {
//         const elapsed = Date.now() - startTime;
//         const progress = Math.min(elapsed / animationDuration, 1);

//         currentIntervalSpeedRef.current =
//           currentIntervalSpeedRef.current +
//           (maxIntervalSpeed - currentIntervalSpeedRef.current) *
//             progress *
//             0.05;

//         if (localIntervalId) {
//           clearInterval(localIntervalId);
//         }

//         let nextIndex = currentIndex;
//         let counter = 0;
//         do {
//           nextIndex = (nextIndex + 1) % rewards.length;
//           counter++;
//         } while (
//           rewards[nextIndex].value === "SpinButton" &&
//           counter < rewards.length * 2
//         );

//         currentIndex = nextIndex;
//         setActiveCellIndex(currentIndex);

//         if (progress < 1) {
//           localIntervalId = setInterval(
//             spinTick,
//             currentIntervalSpeedRef.current,
//           );
//           animationIntervalRef.current = localIntervalId;
//         } else {
//           clearInterval(localIntervalId);
//           animationIntervalRef.current = null;

//           const finalWinningIndex = rewards.findIndex(
//             (item) => item.id === winningItem.id && item.value !== "SpinButton",
//           );
//           setActiveCellIndex(finalWinningIndex);

//           revealAllRewards(winningItem);
//         }
//       };

//       localIntervalId = setInterval(spinTick, currentIntervalSpeedRef.current);
//       animationIntervalRef.current = localIntervalId;

//       return () => {
//         if (animationIntervalRef.current) {
//           clearInterval(animationIntervalRef.current);
//           animationIntervalRef.current = null;
//         }
//       };
//     },
//     [rewards],
//   );

//   const revealAllRewards = useCallback(
//     (winningItem: RewardItem) => {
//       setTimeout(() => {
//         setActiveCellIndex(null);

//         const prizePool = rewards.filter((item) => item.value !== "SpinButton");
//         const revealOrder = [...Array(prizePool.length).keys()].sort(
//           () => Math.random() - 0.5,
//         );

//         let revealIndex = 0;
//         const revealInterval = setInterval(() => {
//           if (revealIndex < prizePool.length) {
//             const itemToReveal = prizePool[revealOrder[revealIndex]];
//             setRewards((prevRewards) =>
//               prevRewards.map((item) =>
//                 item.id === itemToReveal.id
//                   ? { ...item, revealed: true }
//                   : item,
//               ),
//             );
//             revealIndex++;
//           } else {
//             clearInterval(revealInterval);
//             setIsSpinning(false);
//             setSpinHistory((prevHistory) => [...prevHistory, winningItem]);
//           }
//         }, 200);
//       }, 500);
//     },
//     [rewards],
//   );

//   const handleSpin = async () => {
//     if (isSpinning || spinCount >= availableSpins) return;

//     setErrorMessage(null);
//     setIsSpinning(true);
//     setSpinCount((prev) => prev + 1);
//     currentIntervalSpeedRef.current = 50;
//     setActiveCellIndex(null);

//     setRewards((prevRewards) =>
//       prevRewards.map((item) => ({ ...item, revealed: false })),
//     );

//     try {
//       const result = await spinWheelAction();

//       if (result.success && result.winner) {
//         startSpinAnimation(result.winner);
//       } else {
//         setErrorMessage(result.error || "Có lỗi xảy ra khi quay thưởng.");
//         setIsSpinning(false);
//       }
//     } catch (error) {
//       console.error("Client-side error calling Server Action:", error);
//       setErrorMessage("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
//       setIsSpinning(false);
//     }
//   };

//   const handleShowHistory = () => {
//     setShowHistoryModal(true);
//   };

//   const handleCloseHistory = () => {
//     setShowHistoryModal(false);
//   };

//   const handleClearHistory = async () => {
//     setSpinHistory([]);
//     setShowHistoryModal(false);
//   };

//   return (
//     <div className="flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-blue-900 via-indigo-950 to-purple-950 min-h-screen font-sans text-white overflow-hidden relative">
//       <div className="fixed inset-0 overflow-hidden -z-10 opacity-30">
//         <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-cyan-500/20 rounded-full mix-blend-screen filter blur-3xl animate-float-slow delay-1000"></div>
//         <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-fuchsia-500/20 rounded-full mix-blend-screen filter blur-3xl animate-float-medium"></div>
//         <div className="absolute top-[50%] left-[calc(50%-10rem)] w-72 h-72 bg-purple-500/20 rounded-full mix-blend-screen filter blur-3xl animate-float-fast delay-2000"></div>
//       </div>

//       <motion.h1
//         className="text-4xl md:text-6xl font-extrabold text-white mb-8 md:mb-12 tracking-wider drop-shadow-[0_0_15px_rgba(255,255,255,0.7)] animate-pulse-light text-center"
//         initial={{ y: -50, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ duration: 0.8, ease: "easeOut" }}
//       >
//         <span className="text-yellow-400">🎁</span> HỘP QUÀ BÍ ẨN
//       </motion.h1>

//       <div className="grid grid-cols-3 gap-4 md:gap-6 bg-gradient-to-br from-blue-900/50 to-indigo-900/50 p-4 md:p-6 rounded-2xl shadow-xl border border-blue-700/50 backdrop-blur-sm max-w-2xl w-full">
//         <AnimatePresence>
//           {rewards.map((item, index) => (
//             <motion.div
//               key={item.id === 0 ? `spin-btn-${index}` : item.id}
//               className={`
//                 relative flex flex-col items-center justify-center p-3 md:p-4 rounded-xl
//                 border-2 transition-all duration-100 transform-gpu overflow-hidden
//                 ${
//                   item.value === "SpinButton"
//                     ? "border-yellow-400 cursor-pointer"
//                     : item.revealed
//                       ? `border-green-400 cursor-default bg-gradient-to-br ${getRarityBackground(
//                           item.rarity,
//                         )} shadow-lg`
//                       : `border-blue-700 cursor-pointer`
//                 }
//                 ${
//                   !isSpinning && item.value !== "SpinButton" && !item.revealed
//                     ? `hover:border-lime-400 hover:shadow-lime-glow hover:bg-gray-700/80 hover:scale-[1.02]`
//                     : ""
//                 }
//                 ${
//                   item.value === "SpinButton" && !isSpinning
//                     ? "hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,215,0,0.7)]"
//                     : ""
//                 }
//                 ${item.revealed ? "animate-pop-in" : ""}
//                 ${
//                   activeCellIndex === index && item.value !== "SpinButton"
//                     ? `border-white shadow-active-glow animate-border-pulse`
//                     : ""
//                 }
//               `}
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{
//                 opacity: 1,
//                 scale: 1,
//               }}
//               exit={{ opacity: 0, scale: 0.8 }}
//               transition={{
//                 type: "spring",
//                 stiffness: 200,
//                 damping: 20,
//                 delay: index * 0.05,
//               }}
//               onClick={item.value === "SpinButton" ? handleSpin : undefined}
//             >
//               {item.value === "SpinButton" ? (
//                 <motion.div
//                   className={`flex flex-col items-center justify-center w-full h-full text-center
//                     ${
//                       isSpinning
//                         ? "opacity-60 cursor-not-allowed animate-pulse-fast-strong"
//                         : ""
//                     }`}
//                 >
//                   <span className="text-3xl md:text-5xl drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]">
//                     {item.icon}
//                   </span>
//                   <span className="text-xl md:text-2xl font-bold text-yellow-300 mt-2 leading-tight drop-shadow-lg">
//                     {isSpinning ? "ĐANG MỞ..." : item.label}
//                   </span>
//                 </motion.div>
//               ) : (
//                 <motion.div
//                   className={`flex flex-col items-center text-center w-full h-full`}
//                   initial={{ opacity: 1 }}
//                   animate={{ opacity: 1 }}
//                   transition={{ delay: 0 }}
//                 >
//                   {renderIcon(item, activeCellIndex === index)}
//                   <span className="text-sm md:text-base font-bold text-white drop-shadow-[1px_1px_2px_rgba(0,0,0,0.8)] leading-tight">
//                     {item.label}
//                   </span>
//                   <span className="text-[10px] md:text-xs font-semibold text-yellow-200 uppercase mt-1 opacity-90 tracking-wide">
//                     {item.rarity}
//                   </span>
//                   {item.revealed && (
//                     <div className="absolute inset-0 pointer-events-none">
//                       <div className="absolute inset-0 bg-yellow-300/10 opacity-0 animate-fade-in-shine-burst"></div>
//                     </div>
//                   )}
//                 </motion.div>
//               )}
//             </motion.div>
//           ))}
//         </AnimatePresence>
//       </div>

//       {errorMessage && (
//         <motion.div
//           className="mt-4 p-3 bg-red-800 text-white rounded-lg shadow-lg"
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: -20 }}
//         >
//           {errorMessage}
//         </motion.div>
//       )}

//       {/* Footer Info */}
//       <motion.div
//         className="bg-white/5 p-6 rounded-2xl text-center text-white mt-8 backdrop-blur-md border border-white/10 w-full max-w-sm shadow-[0_0_20px_rgba(255,255,255,0.15)]"
//         initial={{ y: 50, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
//       >
//         <p className="mb-4 text-base md:text-lg tracking-wide font-medium">
//           🏆 THÔNG TIN VÒNG QUAY
//         </p>
//         <div className="flex justify-around items-center border-t border-white/20 pt-4">
//           <p className="text-sm md:text-base tracking-wide">
//             Số lượt khả dụng:{" "}
//             <span className="text-yellow-400 font-extrabold text-xl animate-pulse">
//               {availableSpins === Infinity ? "∞" : availableSpins}
//             </span>
//           </p>
//           <p className="text-sm md:text-base tracking-wide">
//             Số lượt đã dùng:{" "}
//             <span className="text-yellow-400 font-extrabold text-xl">
//               {spinCount}
//             </span>
//           </p>
//         </div>

//         {/* Button to open History Modal */}
//         <button
//           onClick={handleShowHistory}
//           className="mt-6 w-full px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-base font-semibold transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
//         >
//           <span className="text-xl">📜</span> Xem Lịch Sử Quay
//         </button>

//         <div className="mt-4 pt-4 border-t border-white/20 text-xs md:text-sm opacity-90">
//           <p className="font-light">
//             ✨ Nhấn nút ở giữa để mở tất cả các hộp quà bí ẩn và khám phá phần
//             thưởng của bạn! Chúc bạn may mắn! ✨
//           </p>
//         </div>
//       </motion.div>

//       {/* History Modal */}
//       <AnimatePresence>
//         {showHistoryModal && (
//           <HistoryModal
//             spinHistory={spinHistory}
//             onClose={handleCloseHistory}
//             onClearHistory={handleClearHistory}
//             renderIcon={renderIcon}
//           />
//         )}
//       </AnimatePresence>

//       <style jsx>{`
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 8px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: rgba(255, 255, 255, 0.1);
//           border-radius: 10px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: rgba(255, 255, 255, 0.3);
//           border-radius: 10px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//           background: rgba(255, 255, 255, 0.5);
//         }

//         @keyframes pulse-light {
//           0%,
//           100% {
//             text-shadow:
//               0 0 10px rgba(255, 255, 255, 0.7),
//               0 0 20px rgba(255, 255, 255, 0.5);
//           }
//           50% {
//             text-shadow:
//               0 0 15px rgba(255, 255, 255, 0.9),
//               0 0 30px rgba(255, 255, 255, 0.7);
//           }
//         }

//         @keyframes pulse-fast-strong {
//           0%,
//           100% {
//             box-shadow: 0 0 25px rgba(255, 215, 0, 0.7);
//           }
//           50% {
//             box-shadow: 0 0 40px rgba(255, 215, 0, 1);
//           }
//         }

//         @keyframes float-slow {
//           0%,
//           100% {
//             transform: translateY(0) translateX(0);
//           }
//           50% {
//             transform: translateY(-20px) translateX(15px);
//           }
//         }

//         @keyframes float-medium {
//           0%,
//           100% {
//             transform: translateY(0) translateX(0);
//           }
//           50% {
//             transform: translateY(25px) translateX(-20px);
//           }
//         }

//         @keyframes float-fast {
//           0%,
//           100% {
//             transform: translateY(0) translateX(0);
//           }
//           50% {
//             transform: translateY(-15px) translateX(-10px);
//           }
//         }

//         @keyframes fade-in-shine-burst {
//           0% {
//             opacity: 0;
//             transform: scale(0.5);
//           }
//           20% {
//             opacity: 0.3;
//             transform: scale(1.1);
//           }
//           40% {
//             opacity: 0.1;
//             transform: scale(1.2);
//           }
//           100% {
//             opacity: 0;
//             transform: scale(1.5);
//           }
//         }

//         .shadow-active-glow {
//           box-shadow:
//             0 0 20px 5px rgba(0, 255, 255, 0.8),
//             inset 0 0 10px 2px rgba(255, 255, 255, 0.6);
//         }

//         .hover\\:shadow-lime-glow:hover {
//           box-shadow:
//             0 0 15px rgba(0, 255, 0, 0.8),
//             inset 0 0 5px rgba(255, 255, 255, 0.5);
//         }

//         @keyframes border-pulse {
//           0%,
//           100% {
//             border-color: white;
//             transform: scale(1);
//           }
//           50% {
//             border-color: lime;
//             transform: scale(1.02);
//           }
//         }
//         @keyframes pulse-fade {
//           0%,
//           100% {
//             opacity: 1;
//           }
//           50% {
//             opacity: 0.7;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default GridSpinWheel;
