import React from "react";

const ANIMAL_ICON = "/assets/wallpaper/animal-icon.svg";
const LOCK_TIME_GLASS = "/assets/wallpaper/lock-time-glass.svg";
const BATTERY_CAP = "/assets/wallpaper/battery-cap.svg";
const WIFI_ICON = "/assets/wallpaper/wifi.svg";
const CELLULAR_ICON = "/assets/wallpaper/cellular.svg";

const DEFAULT_BG = "#5e96df";
const BADGE_TEXT_COLOR = "#375e92";
const KO_WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const KO_MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

type WeekKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

const WEEK_SLOTS: {
  key: WeekKey;
  label: string;
  left: number;
  top: number;
  width: number;
  height: number;
  badgeLeft: number;
  badgeTop: number;
}[] = [
  { key: "Mon", label: "월", left: 0,      top: 0,      width: 96.026,  height: 103.812, badgeLeft: 74.4,  badgeTop: 83.05  },
  { key: "Tue", label: "화", left: 99.49,  top: 0,      width: 96.026,  height: 103.812, badgeLeft: 74.4,  badgeTop: 83.05  },
  { key: "Wed", label: "수", left: 0,      top: 107.27, width: 96.026,  height: 103.812, badgeLeft: 75.26, badgeTop: 82.18  },
  { key: "Thu", label: "목", left: 99.49,  top: 107.27, width: 96.026,  height: 103.812, badgeLeft: 75.26, badgeTop: 83.05  },
  { key: "Fri", label: "금", left: 198.97, top: 0,      width: 96.026,  height: 157.449, badgeLeft: 74.4,  badgeTop: 135.82 },
  { key: "Sat", label: "토", left: 0,      top: 214.55, width: 195.513, height: 103.812, badgeLeft: 174.75,badgeTop: 83.91  },
  { key: "Sun", label: "일", left: 198.97, top: 160.91, width: 96.026,  height: 157.449, badgeLeft: 76.13, badgeTop: 137.55 },
];

const CELL_W = 42.143;
const CELL_H = 54.969;
const GRID_COLS = 7;

export type WallpaperFrameStyle =
  | "Default"
  | "Postcard"
  | "Polaroid"
  | "Apple"
  | "Note"
  | "Spark"
  | "Star";

export const WALLPAPER_STYLES: WallpaperFrameStyle[] = [
  "Default", "Postcard", "Polaroid", "Apple", "Note", "Spark", "Star",
];

export interface WallpaperFrameProps {
  type: "week" | "month";
  frameStyle?: WallpaperFrameStyle;
  previewContainer?: boolean;
  photoMap?: Record<string, string>;
  year: number;
  month: number;
  petName?: string;
  previewDate?: Date;
  bgColor?: string;
}

function DayBadge({ label, left, top }: { label: string; left: number; top: number }) {
  return (
    <div style={{
      position: "absolute",
      left,
      top,
      width: 15.572,
      height: 15.572,
      borderRadius: 25,
      backgroundColor: "#fff",
      border: "0.865px solid #fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxSizing: "border-box",
    }}>
      <span style={{
        fontFamily: "'Ownglyph PDH', sans-serif",
        fontSize: 12.11,
        lineHeight: "99.905%",
        color: BADGE_TEXT_COLOR,
        textAlign: "center",
        display: "block",
      }}>
        {label}
      </span>
    </div>
  );
}

function WeekGrid({ photoMap, bgColor }: { photoMap?: Record<string, string>; bgColor: string }) {
  return (
    <div style={{ position: "relative", width: 295, height: 318.358, flexShrink: 0 }}>
      {WEEK_SLOTS.map((slot) => (
        <div
          key={slot.key}
          style={{
            position: "absolute",
            left: slot.left,
            top: slot.top,
            width: slot.width,
            height: slot.height,
            borderRadius: 10.381,
            backgroundColor: bgColor,
            overflow: "hidden",
          }}
        >
          {photoMap?.[slot.key] && (
            <img
              src={photoMap[slot.key]}
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                pointerEvents: "none",
              }}
            />
          )}
          <DayBadge label={slot.label} left={slot.badgeLeft} top={slot.badgeTop} />
        </div>
      ))}
    </div>
  );
}

function MonthGrid({ photoMap }: { photoMap?: Record<string, string> }) {
  return (
    <div style={{ position: "relative", width: 295, height: CELL_H * 5, flexShrink: 0 }}>
      {Array.from({ length: 31 }, (_, i) => {
        const day = i + 1;
        const col = i % GRID_COLS;
        const row = Math.floor(i / GRID_COLS);
        const src = photoMap?.[String(day)];
        return (
          <div
            key={day}
            style={{
              position: "absolute",
              left: col * CELL_W,
              top: row * CELL_H,
              width: CELL_W,
              height: CELL_H,
              backgroundColor: "#fff",
              overflow: "hidden",
            }}
          >
            {src && (
              <img
                src={src}
                alt=""
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  pointerEvents: "none",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function GlassButton({ icon }: { icon: string }) {
  return (
    <div style={{
      width: 54.104,
      height: 54.104,
      borderRadius: "100%",
      position: "relative",
      backdropFilter: "blur(37.313px)",
      backgroundColor: "rgba(255,255,255,0.15)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}>
      <span style={{
        fontSize: 19.59,
        color: "rgba(217,217,217,0.9)",
        mixBlendMode: "plus-lighter",
      }}>
        {icon}
      </span>
    </div>
  );
}

function PreviewContainer({ month, previewDate }: { month: number; previewDate?: Date }) {
  const d = previewDate ?? new Date();
  const displayDay = d.getDate();
  const displayWeekday = KO_WEEKDAYS[d.getDay()];
  const displayMonth = month;

  return (
    <>
      {/* Status Bar */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 57.836 }}>
        {/* Cellular */}
        <img
          src={CELLULAR_ICON}
          alt=""
          style={{
            position: "absolute",
            right: 85.63,
            top: "50%",
            transform: "translateY(calc(-50% + 1.96px))",
            height: 11.194,
            width: 17.91,
          }}
        />
        {/* Wifi */}
        <img
          src={WIFI_ICON}
          alt=""
          style={{
            position: "absolute",
            right: 62.65,
            top: "50%",
            transform: "translateY(calc(-50% + 2.1px))",
            height: 11.287,
            width: 15.99,
          }}
        />
        {/* Battery */}
        <div style={{
          position: "absolute",
          right: 32.46,
          top: "50%",
          transform: "translateY(calc(-50% + 1.96px))",
          width: 23.321,
          height: 12.127,
          border: "0.933px solid #fff",
          borderRadius: 4.011,
          opacity: 0.35,
          boxSizing: "border-box",
        }} />
        <div style={{
          position: "absolute",
          right: 34.51,
          top: "50%",
          transform: "translateY(calc(-50% + 1.96px))",
          width: 19.59,
          height: 8.396,
          backgroundColor: "#fff",
          borderRadius: 2.332,
        }} />
        <img
          src={BATTERY_CAP}
          alt=""
          style={{
            position: "absolute",
            right: 30.38,
            top: "50%",
            transform: "translateY(calc(-50% + 2.11px))",
            width: 1.239,
            height: 3.731,
          }}
        />
      </div>

      {/* Lock Screen Widget — date */}
      <div style={{
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        top: 76.49,
        width: 375,
        height: 24.254,
        backdropFilter: "blur(9.328px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        <p style={{
          margin: 0,
          fontFamily: "'SF Pro', 'Noto Sans KR', sans-serif",
          fontWeight: 590,
          fontSize: 19.14,
          lineHeight: "normal",
          textAlign: "center",
          color: "#fff",
          mixBlendMode: "plus-lighter",
          letterSpacing: -0.1866,
          width: "100%",
        }}>
          {displayMonth}월 {displayDay}일 ({displayWeekday})
        </p>
      </div>

      {/* 9:41 Glass Effect (time display) */}
      <img
        src={LOCK_TIME_GLASS}
        alt=""
        style={{
          position: "absolute",
          left: "calc(50% - 0.44px)",
          transform: "translateX(-50%)",
          top: 107.28,
          width: 191.287,
          height: 81.53,
        }}
      />

      {/* Bottom Controls */}
      <div style={{
        position: "absolute",
        top: 714.55,
        left: 42.91,
        width: 289.179,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <GlassButton icon="🔦" />
        <GlassButton icon="📷" />
      </div>
    </>
  );
}

export default function WallpaperFrame({
  type,
  frameStyle = "Default",
  previewContainer = true,
  photoMap,
  year,
  month,
  petName = "",
  previewDate,
  bgColor = DEFAULT_BG,
}: WallpaperFrameProps) {
  const subtitleText = `${year}년 ${KO_MONTHS[month - 1]} ${petName}. 오늘도 귀여웠어`;
  const isWeek = type === "week";
  const contentTop = isWeek ? "calc(50% + 82.92px)" : "calc(50% + 73.91px)";

  const frame = (
    <div style={{
      width: 375,
      height: 812,
      backgroundColor: bgColor,
      position: "relative",
      overflow: "hidden",
      flexShrink: 0,
      boxSizing: "border-box",
    }}>
      {/* Main content — subtitle + photo grid */}
      <div style={{
        position: "absolute",
        left: "50%",
        top: contentTop,
        transform: "translate(-50%, -50%)",
        width: 295,
        display: "flex",
        flexDirection: "column",
        gap: isWeek ? 6.056 : 5.16,
        alignItems: "flex-start",
      }}>
        {/* Subtitle row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: isWeek ? 5.191 : 5.174,
          flexShrink: 0,
        }}>
          <p style={{
            margin: 0,
            fontFamily: "'Dongle', sans-serif",
            fontWeight: 400,
            fontSize: isWeek ? 17.302 : 17.248,
            lineHeight: "normal",
            color: "#fff",
            whiteSpace: "nowrap",
          }}>
            {subtitleText}
          </p>
          <div style={{
            width: isWeek ? 15.481 : 15.433,
            height: isWeek ? 15.481 : 15.433,
            position: "relative",
            overflow: "hidden",
            flexShrink: 0,
          }}>
            <img
              src={ANIMAL_ICON}
              alt=""
              style={{ width: "100%", height: "100%", display: "block" }}
            />
          </div>
        </div>

        {/* Photo grid */}
        {isWeek ? <WeekGrid photoMap={photoMap} bgColor={bgColor} /> : <MonthGrid photoMap={photoMap} />}
      </div>

      {/* iOS preview overlay */}
      {previewContainer && (
        <PreviewContainer month={month} previewDate={previewDate} />
      )}
    </div>
  );

  if (!previewContainer) {
    return (
      <div style={{ padding: 50, boxSizing: "border-box", backgroundColor: bgColor }}>
        {frame}
      </div>
    );
  }

  return frame;
}
