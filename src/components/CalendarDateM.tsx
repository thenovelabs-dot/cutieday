import React from "react";

export type CalendarDateMState = "Default" | "Disabled" | "Today" | "Image" | "None";

interface Props {
  state?: CalendarDateMState;
  day?: number;
  imageUrl?: string;
  onClick?: () => void;
  selected?: boolean;
}

export default function CalendarDateM({ state = "Default", day = 1, imageUrl, onClick, selected = false }: Props) {
  const borderColor = state === "Today" ? "#99BAE6" : "#4E5968";

  const bgColor =
    state === "Today"  ? "#E8F3FF"
    : state === "Image"  ? "transparent"
    : state === "None"   ? "white"
    : "#F2F4F6";

  const textStyle: React.CSSProperties = {
    fontSize: 15,
    fontWeight: state === "Today" ? 700 : 590,
    lineHeight: 1.252,
    margin: 0,
    textAlign: "center",
    color:
      state === "Today"                    ? "#508FE1"
      : state === "Disabled" && selected   ? "#6B7684"
      : state === "Disabled"               ? "#B0B8C1"
      : selected                           ? "#4E5968"
      : "#8B95A1",
  };

  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "1",
        position: "relative",
        cursor: onClick ? "pointer" : "default",
        flexShrink: 0,
        WebkitTextSizeAdjust: "none",
      }}
      onClick={onClick}
    >
      {/* SVG 필터 정의 — Dynamic stroke 근사: feTurbulence + feDisplacementMap */}
      {selected && (
        <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", pointerEvents: "none" }}>
          <defs>
            <filter id="wavy-cal-sel" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.18" numOctaves="2" seed="5" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.6" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
      )}

      {/* 셀 콘텐츠 */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 12,
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
        {(state === "Default" || state === "Today" || state === "Disabled") && (
          <p style={textStyle}>{day}</p>
        )}
      </div>

      {/* 웨이비 테두리 오버레이 — 콘텐츠와 분리해서 필터 적용 */}
      {selected && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 12,
            border: `2px solid ${borderColor}`,
            boxSizing: "border-box",
            pointerEvents: "none",
            filter: "url(#wavy-cal-sel)",
          }}
        />
      )}
    </div>
  );
}
