import React from "react";

export type CalendarDateLState = "Default" | "Disabled" | "Today" | "Image";

interface Props {
  state?: CalendarDateLState;
  day?: number;
  weekday?: string;
  imageUrl?: string;
  onClick?: () => void;
  selected?: boolean;
}

export default function CalendarDateL({
  state = "Default",
  day = 1,
  weekday = "월",
  imageUrl,
  onClick,
  selected = false,
}: Props) {
  const borderColor = state === "Today" ? "#508FE1" : "#4E5968";

  const bgColor =
    state === "Today"  ? "#E8F3FF"
    : state === "Image"  ? "transparent"
    : "#F2F4F6";

  const numberStyle: React.CSSProperties = {
    fontSize: 17,
    fontWeight: 700,
    lineHeight: 1.35,
    margin: 0,
    textAlign: "center",
    color:
      state === "Today"                    ? "#508FE1"
      : state === "Disabled" && selected   ? "#6B7684"
      : state === "Disabled"               ? "#D1D6DB"
      : selected                           ? "#4E5968"
      : "#8B95A1",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        alignItems: "flex-start",
        width: "100%",
        cursor: onClick ? "pointer" : "default",
        WebkitTextSizeAdjust: "none",
      }}
      onClick={onClick}
    >
      {/* 요일 레이블 */}
      <div style={{ width: "100%", paddingLeft: 6, paddingRight: 6, boxSizing: "border-box" }}>
        <p style={{ fontSize: 13, fontWeight: 510, lineHeight: 1.252, margin: 0, textAlign: "center", color: "#B0B8C1", width: "100%" }}>
          {weekday}
        </p>
      </div>

      {/* 날짜 셀 */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "1" }}>
        {/* SVG 필터 — CalendarDateM과 동일 방식, 6px 테두리 */}
        {selected && (
          <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", pointerEvents: "none" }}>
            <defs>
              <filter id="wavy-cal-l-sel" x="-30%" y="-30%" width="160%" height="160%">
                <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" seed="5" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="4.5" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
          </svg>
        )}

        {/* 셀 콘텐츠 */}
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 24,
            backgroundColor: bgColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            boxSizing: "border-box",
            position: "relative",
          }}
        >
          {state === "Image" && imageUrl && (
            <img
              src={imageUrl}
              alt=""
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
          {state !== "Image" && <p style={numberStyle}>{day}</p>}
        </div>

        {/* 웨이비 테두리 오버레이 — 6px */}
        {selected && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 24,
              border: `2px solid ${borderColor}`,
              boxSizing: "border-box",
              pointerEvents: "none",
              filter: "url(#wavy-cal-l-sel)",
            }}
          />
        )}
      </div>
    </div>
  );
}
