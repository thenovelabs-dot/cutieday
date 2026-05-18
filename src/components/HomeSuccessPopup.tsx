import React from "react";

const PAW_ICON = "/assets/paw-icon.svg";
const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;

interface Props {
  day: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  onClose: () => void;
  onMakeWallpaper?: () => void;
}

function PawCircle({ filled }: { filled: boolean }) {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        backgroundColor: filled ? "#508FE1" : "#D1D6DB",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {filled && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ transform: "rotate(20.38deg)", flexShrink: 0 }}>
            <img
              src={PAW_ICON}
              alt=""
              style={{ width: 15.273, height: 14.368, display: "block" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomeSuccessPopup({ day, onClose, onMakeWallpaper }: Props) {
  const isDay7 = day === 7;
  const remaining = 7 - day;

  return (
    <div style={s.overlay}>
      <div style={s.card}>

        {/* 상단 콘텐츠 */}
        <div style={s.content}>

          {/* 일차 + 기록 성공 */}
          <div style={s.titleGroup}>
            <p style={s.dayText}>{day}일차</p>
            <p style={s.successText}>기록 성공!</p>
          </div>

          {/* 요일 스트릭 */}
          <div style={s.streakRow}>
            {WEEKDAYS.map((wd, i) => (
              <div key={wd} style={s.recordUnit}>
                <p style={s.weekdayLabel}>{wd}</p>
                <PawCircle filled={i < day} />
              </div>
            ))}
          </div>

          {/* 메시지 */}
          <div style={s.messageBlock}>
            {isDay7 ? (
              <>
                <p style={s.messageText}>
                  <span style={s.highlight}>일주일 </span>
                  <span>업로드를 성공했어요!</span>
                </p>
                <p style={s.messageText}>주간 배경화면을 바로 만들어보세요.</p>
              </>
            ) : (
              <>
                <p style={s.messageText}>
                  <span style={s.highlight}>{remaining}일</span>
                  <span>만 더 업로드하면</span>
                </p>
                <p style={s.messageText}>주간 배경화면을 만들 수 있어요!</p>
              </>
            )}
          </div>
        </div>

        {/* 버튼 */}
        {isDay7 ? (
          <div style={s.btnRow}>
            <button style={s.btnClose} onClick={onClose}>닫기</button>
            <button style={s.btnConfirm} onClick={onMakeWallpaper}>만들러가기</button>
          </div>
        ) : (
          <button style={{ ...s.btnConfirm, width: "100%" }} onClick={onClose}>
            확인했어요
          </button>
        )}

      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  card: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingTop: 48,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 48,
    boxSizing: "border-box",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
    width: "100%",
  },
  titleGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  dayText: {
    margin: 0,
    fontSize: 40,
    fontWeight: 700,
    lineHeight: 1.35,
    color: "#191F28",
    whiteSpace: "nowrap",
  },
  successText: {
    margin: 0,
    fontSize: 15,
    fontWeight: 400,
    lineHeight: 1.35,
    color: "#8B95A1",
    textAlign: "center",
  },
  streakRow: {
    display: "flex",
    gap: 2,
    alignItems: "center",
    backgroundColor: "rgba(2,32,71,0.05)",
    padding: 12,
    borderRadius: 12,
    flexShrink: 0,
  },
  recordUnit: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    width: 32,
    flexShrink: 0,
  },
  weekdayLabel: {
    margin: 0,
    fontSize: 13,
    fontWeight: 510,
    lineHeight: 1.35,
    color: "#4E5968",
    textAlign: "center",
    width: "100%",
  },
  messageBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    padding: 8,
    width: "100%",
  },
  messageText: {
    margin: 0,
    fontSize: 13,
    fontWeight: 510,
    lineHeight: 1.35,
    color: "#4E5968",
    textAlign: "center",
  },
  highlight: {
    color: "#508FE1",
  },
  btnRow: {
    display: "flex",
    gap: 8,
    width: "100%",
  },
  btnClose: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    border: "none",
    backgroundColor: "rgba(7,25,76,0.05)",
    color: "rgba(3,18,40,0.7)",
    fontSize: 17,
    fontWeight: 590,
    cursor: "pointer",
    outline: "none",
  },
  btnConfirm: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    border: "none",
    backgroundColor: "#508FE1",
    color: "#fff",
    fontSize: 17,
    fontWeight: 590,
    cursor: "pointer",
    outline: "none",
  },
};
