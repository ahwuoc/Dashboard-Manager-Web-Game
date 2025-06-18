"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { spinWheelAction, getSpinHistoryAction } from "./actions";
import { RewardItem } from "./types";
import { getRarityBackground, renderIcon } from "./helpers";

import { ORIGINAL_REWARDS_DATA } from "./rewards";

import styles from "./GridSpinWheel.module.css";

interface HistoryModalProps {
  spinHistory: RewardItem[];
  onClose: () => void;
  onClearHistory: () => void;
  renderIcon: (item: RewardItem, isActive: boolean) => React.JSX.Element;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
  spinHistory,
  onClose,
  onClearHistory,
  renderIcon,
}) => {
  return (
    <motion.div
      className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`bg-gray-900 rounded-lg shadow-xl border border-gray-700 w-full max-w-md p-6 relative`}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold transition-colors`}
        >
          &times;
        </button>
        <h3
          className={`text-2xl font-bold text-yellow-400 mb-4 text-center flex items-center justify-center`}
        >
          <span className={`mr-2`}>📜</span> LỊCH SỬ QUAY CỦA TÔI
          <span className={`ml-2`}>📜</span>
        </h3>
        {spinHistory.length === 0 ? (
          <p className={`text-center text-gray-400 mt-8 mb-8`}>
            Chưa có phần thưởng nào được quay. Hãy thử vận may!
          </p>
        ) : (
          <>
            <div
              className={`max-h-80 overflow-y-auto ${styles.customScrollbar} pr-2`}
            >
              {spinHistory.map((item: RewardItem, histIndex: number) => (
                <motion.div
                  key={`history-${item.id}-${histIndex}`}
                  className={`flex items-center justify-between p-3 my-2 rounded-lg border border-white/10 transition-all duration-300
                                ${
                                  histIndex === 0 && !item.revealed
                                    ? `bg-gradient-to-r from-lime-700/30 to-blue-700/30 ${styles.pulseFade} shadow-lg`
                                    : `bg-white/5`
                                }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`flex items-center`}>
                    {renderIcon(item, false)}
                    <span
                      className={`ml-3 text-base md:text-lg font-medium text-white`}
                    >
                      {item.label}
                    </span>
                  </div>
                  <span
                    className={`text-xs md:text-sm font-semibold uppercase px-2.5 py-1 rounded-full
                                        ${getRarityBackground(item.rarity).replace("from-", "bg-").replace("to-", "")}`}
                  >
                    {item.rarity}
                  </span>
                </motion.div>
              ))}
            </div>
            <button
              onClick={onClearHistory}
              className={`mt-6 w-full px-5 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-base font-semibold transition-colors duration-200 shadow-md hover:shadow-lg`}
            >
              Xóa Lịch Sử
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

interface WinningModalProps {
  reward: RewardItem | null;
  onClose: () => void;
  renderIcon: (item: RewardItem, isActive: boolean) => React.JSX.Element;
}

const WinningModal: React.FC<WinningModalProps> = ({
  reward,
  onClose,
  renderIcon,
}) => {
  if (!reward) {
    return null;
  }

  return (
    <motion.div
      className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`bg-gray-900 rounded-lg shadow-xl border border-gray-700 w-full max-w-md p-6 relative`}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold transition-colors`}
        >
          &times;
        </button>
        <h3
          className={`text-2xl font-bold text-green-400 mb-4 text-center flex items-center justify-center`}
        >
          <span className={`mr-2`}>🎉</span> CHÚC MỪNG!{" "}
          <span className={`ml-2`}>🎉</span>
        </h3>
        <div
          className={`flex flex-col items-center justify-center mb-4 text-center`}
        >
          {renderIcon(reward, true)}
          <p className={`text-xl font-semibold text-white mb-1`}>
            {reward.label}
          </p>
          {reward.value !== reward.label && (
            <p className={`text-lg text-gray-300`}>{reward.value}</p>
          )}
          <span
            className={`text-xs font-semibold uppercase px-2.5 py-1 rounded-full mt-2
                                ${getRarityBackground(reward.rarity).replace("from-", "bg-").replace("to-", "")}`}
          >
            {reward.rarity}
          </span>
        </div>
        <button
          onClick={onClose}
          className={`w-full px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-base font-semibold transition-colors duration-200 shadow-md hover:shadow-lg`}
        >
          Nhận Phần Thưởng
        </button>
      </motion.div>
    </motion.div>
  );
};

interface SpinButtonReward extends Omit<RewardItem, "id"> {
  id: 0;
  value: "SpinButton";
}

const GridSpinWheel: React.FC = () => {
  const shuffledRewardsRef = useRef<RewardItem[]>(
    ORIGINAL_REWARDS_DATA.filter((item) => item.value !== "Spin").sort(
      () => Math.random() - 0.5,
    ),
  );

  const [rewards, setRewards] = useState<RewardItem[]>(() => {
    const arrangedRewards: RewardItem[] = [...shuffledRewardsRef.current];
    const spinButton: SpinButtonReward = {
      id: 0,
      label: "Nhấn để rút thăm",
      value: "SpinButton",
      icon: "✨",
      rarity: "Common",
      revealed: false,
      color: "#FFD700",
    };
    arrangedRewards.splice(4, 0, spinButton);
    return arrangedRewards;
  });

  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinCount, setSpinCount] = useState<number>(0);
  const availableSpins: number = Infinity;

  const [activeCellIndex, setActiveCellIndex] = useState<number | null>(null);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentIntervalSpeedRef = useRef<number>(50);
  const animationDuration: number = 4000;
  const maxIntervalSpeed: number = 250;

  const [spinHistory, setSpinHistory] = useState<RewardItem[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showWinningModal, setShowWinningModal] = useState<boolean>(false);
  const [winningReward, setWinningReward] = useState<RewardItem | null>(null);

  useEffect(() => {
    async function loadHistory(): Promise<void> {
      try {
        const history: RewardItem[] = await getSpinHistoryAction();
        setSpinHistory(history.reverse());
      } catch (error) {
        console.error("Failed to load spin history:", error);
        setErrorMessage("Không thể tải lịch sử quay. Vui lòng thử lại sau.");
      }
    }
    loadHistory();
  }, []);
  const startSpinAnimation = useCallback(
    (winningItem: RewardItem): (() => void) => {
      let currentIndex: number = -1;
      const startTime: number = Date.now();
      let localIntervalId: NodeJS.Timeout | null = null;
      let finalIndexReached: boolean = false;

      const spinTick = (): void => {
        const elapsed: number = Date.now() - startTime;
        const progress: number = Math.min(elapsed / animationDuration, 1);
        currentIntervalSpeedRef.current = Math.min(
          currentIntervalSpeedRef.current +
            (maxIntervalSpeed - currentIntervalSpeedRef.current) *
              progress *
              0.05,
          maxIntervalSpeed,
        );

        if (localIntervalId) {
          clearInterval(localIntervalId);
        }

        let nextIndex: number = currentIndex;
        let counter: number = 0;
        do {
          nextIndex = (nextIndex + 1) % rewards.length;
          counter++;
        } while (
          rewards[nextIndex].value === "SpinButton" &&
          counter < rewards.length * 2
        );

        currentIndex = nextIndex;
        setActiveCellIndex(currentIndex);

        if (progress >= 1) {
          const targetIndex: number = rewards.findIndex(
            (item) => item.id === winningItem.id && item.value !== "SpinButton",
          );
          if (targetIndex !== -1) {
            setActiveCellIndex(targetIndex);
            finalIndexReached = true;
          }
        }

        if (!finalIndexReached) {
          localIntervalId = setInterval(
            spinTick,
            currentIntervalSpeedRef.current,
          );
          animationIntervalRef.current = localIntervalId;
        } else {
          if (localIntervalId) clearInterval(localIntervalId);
          animationIntervalRef.current = null;
          revealAllRewards(winningItem);
        }
      };

      localIntervalId = setInterval(spinTick, currentIntervalSpeedRef.current);
      animationIntervalRef.current = localIntervalId;

      return (): void => {
        if (animationIntervalRef.current) {
          clearInterval(animationIntervalRef.current);
          animationIntervalRef.current = null;
        }
      };
    },
    [rewards, animationDuration, maxIntervalSpeed],
  );

  const revealAllRewards = useCallback(
    (winningItem: RewardItem): void => {
      setTimeout(() => {
        setActiveCellIndex(null);

        const prizePool: RewardItem[] = rewards.filter(
          (item) => item.value !== "SpinButton",
        );
        const nonWinningRewards: RewardItem[] = prizePool.filter(
          (item) => item.id !== winningItem.id,
        );
        const revealOrder: RewardItem[] = [...nonWinningRewards, winningItem]
          .map((item, i, arr) => arr[i])
          .sort(() => Math.random() - 0.5);

        let revealIndex: number = 0;
        const revealInterval: NodeJS.Timeout = setInterval(() => {
          if (revealIndex < revealOrder.length) {
            const itemToReveal: RewardItem = revealOrder[revealIndex];
            setRewards((prevRewards) =>
              prevRewards.map((item) =>
                item.id === itemToReveal.id
                  ? { ...item, revealed: true }
                  : item,
              ),
            );
            revealIndex++;
          } else {
            clearInterval(revealInterval);
            setIsSpinning(false);
            setSpinHistory((prevHistory) => [winningItem, ...prevHistory]);
            setWinningReward(winningItem);
            setShowWinningModal(true);
          }
        }, 200);
      }, 500);
    },
    [rewards],
  );

  const handleSpin = async (): Promise<void> => {
    if (isSpinning || spinCount >= availableSpins) return;

    setErrorMessage(null);
    setIsSpinning(true);
    setSpinCount((prev) => prev + 1);
    currentIntervalSpeedRef.current = 50;
    setActiveCellIndex(null);
    setShowWinningModal(false);
    setWinningReward(null);

    setRewards((prevRewards) =>
      prevRewards.map((item) => ({ ...item, revealed: false })),
    );

    try {
      const result = await spinWheelAction();

      if (result.success && result.winner) {
        startSpinAnimation(result.winner);
      } else {
        setErrorMessage(result.error || "Có lỗi xảy ra khi quay thưởng.");
        setIsSpinning(false);
      }
    } catch (error) {
      console.error("Client-side error calling Server Action:", error);
      setErrorMessage("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
      setIsSpinning(false);
    }
  };

  const handleShowHistory = (): void => {
    setShowHistoryModal(true);
  };

  const handleCloseHistory = (): void => {
    setShowHistoryModal(false);
  };

  const handleClearHistory = async (): Promise<void> => {
    setSpinHistory([]);
    setShowHistoryModal(false);
  };

  const handleCloseWinningModal = (): void => {
    setShowWinningModal(false);
    setWinningReward(null);
    const reShuffledRewards: RewardItem[] = ORIGINAL_REWARDS_DATA.filter(
      (item) => item.value !== "Spin",
    ).sort(() => Math.random() - 0.5);

    const newArrangedRewards: RewardItem[] = [...reShuffledRewards];
    const spinButton: SpinButtonReward = {
      id: 0,
      label: "Nhấn để rút thăm",
      value: "SpinButton",
      icon: "✨",
      rarity: "Common",
      revealed: false,
      color: "#FFD700",
    };
    newArrangedRewards.splice(4, 0, spinButton);
    setRewards(newArrangedRewards);
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-blue-900 via-indigo-950 to-purple-950 min-h-screen font-sans text-white overflow-hidden relative`}
    >
      <div className={`fixed inset-0 overflow-hidden -z-10 opacity-30`}>
        <div
          className={`absolute top-[10%] left-[5%] w-64 h-64 bg-cyan-500/20 rounded-full mix-blend-screen filter blur-3xl ${styles.floatSlow} delay-1000`}
        ></div>
        <div
          className={`absolute bottom-[20%] right-[10%] w-80 h-80 bg-fuchsia-500/20 rounded-full mix-blend-screen filter blur-3xl ${styles.floatMedium}`}
        ></div>
        <div
          className={`absolute top-[50%] left-[calc(50%-10rem)] w-72 h-72 bg-purple-500/20 rounded-full mix-blend-screen filter blur-3xl ${styles.floatFast} delay-2000`}
        ></div>
      </div>

      <motion.h1
        className={`text-4xl md:text-6xl font-extrabold text-white mb-8 md:mb-12 tracking-wider drop-shadow-[0_0_15px_rgba(255,255,255,0.7)] ${styles.pulseLight} text-center`}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <span className={`text-yellow-400`}>🎁</span> HỘP QUÀ BÍ ẨN
      </motion.h1>

      <div
        className={`grid grid-cols-3 gap-4 md:gap-6 bg-gradient-to-br from-blue-900/50 to-indigo-900/50 p-4 md:p-6 rounded-2xl shadow-xl border border-blue-700/50 backdrop-blur-sm max-w-2xl w-full`}
      >
        <AnimatePresence>
          {rewards.map((item: RewardItem, index: number) => (
            <motion.div
              key={item.id === 0 ? `spin-btn-${index}` : item.id}
              className={`
                relative flex flex-col items-center justify-center p-3 md:p-4 rounded-xl
                border-2 transition-all duration-100 transform-gpu overflow-hidden
                ${
                  item.value === "SpinButton"
                    ? `border-yellow-400 cursor-pointer`
                    : item.revealed
                      ? `border-green-400 cursor-default bg-gradient-to-br ${getRarityBackground(
                          item.rarity,
                        )} shadow-lg`
                      : `border-blue-700 cursor-pointer`
                }
                ${
                  !isSpinning && item.value !== "SpinButton" && !item.revealed
                    ? `hover:border-lime-400 ${styles.hoverShadowLimeGlow} hover:bg-gray-700/80 hover:scale-[1.02]`
                    : ``
                }
                ${
                  item.value === "SpinButton" && !isSpinning
                    ? `hover:scale-105 active:scale-95 ${styles.pulseFastStrong}`
                    : ``
                }
                ${item.revealed ? `${styles.popIn}` : ``}
                ${
                  activeCellIndex === index && item.value !== "SpinButton"
                    ? `border-white ${styles.shadowActiveGlow} ${styles.borderPulse}`
                    : ``
                }
              `}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                type: `spring`,
                stiffness: 200,
                damping: 20,
                delay: index * 0.05,
              }}
              onClick={item.value === `SpinButton` ? handleSpin : undefined}
            >
              {item.value === `SpinButton` ? (
                <motion.div
                  className={`flex flex-col items-center justify-center w-full h-full text-center
                    ${
                      isSpinning
                        ? `opacity-60 cursor-not-allowed ${styles.pulseFastStrong}`
                        : ``
                    }`}
                >
                  <span
                    className={`text-3xl md:text-5xl drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]`}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={`text-xl md:text-2xl font-bold text-yellow-300 mt-2 leading-tight drop-shadow-lg`}
                  >
                    {isSpinning ? `ĐANG MỞ...` : item.label}
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  className={`flex flex-col items-center text-center w-full h-full`}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0 }}
                >
                  {renderIcon(item, activeCellIndex === index)}
                  <span
                    className={`text-sm md:text-base font-bold text-white drop-shadow-[1px_1px_2px_rgba(0,0,0,0.8)] leading-tight`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`text-[10px] md:text-xs font-semibold text-yellow-200 uppercase mt-1 opacity-90 tracking-wide`}
                  >
                    {item.rarity}
                  </span>
                  {item.revealed && (
                    <div className={`absolute inset-0 pointer-events-none`}>
                      <div
                        className={`absolute inset-0 bg-yellow-300/10 opacity-0 ${styles.fadeInShineBurst}`}
                      ></div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {errorMessage && (
        <motion.div
          className={`mt-4 p-3 bg-red-800 text-white rounded-lg shadow-lg`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {errorMessage}
        </motion.div>
      )}

      <motion.div
        className={`bg-white/5 p-6 rounded-2xl text-center text-white mt-8 backdrop-blur-md border border-white/10 w-full max-w-sm shadow-[0_0_20px_rgba(255,255,255,0.15)]`}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
      >
        <p className={`mb-4 text-base md:text-lg tracking-wide font-medium`}>
          🏆 THÔNG TIN VÒNG QUAY
        </p>
        <div
          className={`flex justify-around items-center border-t border-white/20 pt-4`}
        >
          <p className={`text-sm md:text-base tracking-wide`}>
            Số lượt khả dụng:{" "}
            <span
              className={`text-yellow-400 font-extrabold text-xl animate-pulse`}
            >
              {availableSpins === Infinity ? `∞` : availableSpins}
            </span>
          </p>
          <p className={`text-sm md:text-base tracking-wide`}>
            Số lượt đã dùng:{" "}
            <span className={`text-yellow-400 font-extrabold text-xl`}>
              {spinCount}
            </span>
          </p>
        </div>

        <button
          onClick={handleShowHistory}
          className={`mt-6 w-full px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-base font-semibold transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2`}
        >
          <span className={`text-xl`}>📜</span> Xem Lịch Sử Quay
        </button>

        <div
          className={`mt-4 pt-4 border-t border-white/20 text-xs md:text-sm opacity-90`}
        >
          <p className={`font-light`}>
            ✨ Nhấn nút ở giữa để mở tất cả các hộp quà bí ẩn và khám phá phần
            thưởng của bạn! Chúc bạn may mắn! ✨
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {showHistoryModal && (
          <HistoryModal
            spinHistory={spinHistory}
            onClose={handleCloseHistory}
            onClearHistory={handleClearHistory}
            renderIcon={renderIcon}
          />
        )}
        {showWinningModal && winningReward && (
          <WinningModal
            reward={winningReward}
            onClose={handleCloseWinningModal}
            renderIcon={renderIcon}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GridSpinWheel;
