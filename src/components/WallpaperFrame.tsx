import React from "react";

const BASE = "/assets/wallpaperComponenet/";
const ANIMAL_ICON = "/assets/wallpaper/animal-icon.svg";
const DEFAULT_BG = "#5e96df";
const BADGE_TEXT_COLOR = "#375e92";
const KO_MONTHS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

type WeekKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
const WEEK_DAYS: { key: WeekKey; label: string }[] = [
  { key: "Mon", label: "월" }, { key: "Tue", label: "화" },
  { key: "Wed", label: "수" }, { key: "Thu", label: "목" },
  { key: "Fri", label: "금" }, { key: "Sat", label: "토" },
  { key: "Sun", label: "일" },
];

type CellRect = { x: number; y: number; w: number; h: number };

export type WallpaperFrameStyle = "Default" | "Postcard" | "Polaroid" | "Apple" | "Note" | "Spark" | "Star";
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
  week?: number;
  petName?: string;
  previewDate?: Date;
  bgColor?: string;
}

// ── 주별 포토 셀 절대 좌표 (375×812 기준) ─────────────────────
const WEEK_CELLS: Record<WallpaperFrameStyle, Record<WeekKey, CellRect>> = {
  Default:  { Mon:{x:40,y:345,w:96,h:104}, Tue:{x:139,y:345,w:96,h:104}, Wed:{x:40,y:453,w:96,h:104}, Thu:{x:139,y:453,w:96,h:104}, Fri:{x:239,y:345,w:96,h:157}, Sat:{x:40,y:560,w:196,h:104}, Sun:{x:239,y:506,w:96,h:157} },
  Postcard: { Mon:{x:125,y:322,w:57,h:76}, Tue:{x:204,y:333,w:58,h:76}, Wed:{x:136,y:419,w:58,h:76}, Thu:{x:204,y:419,w:58,h:76}, Fri:{x:136,y:506,w:58,h:76}, Sat:{x:204,y:506,w:58,h:76}, Sun:{x:136,y:593,w:58,h:76} },
  Polaroid: { Mon:{x:69,y:330,w:73,h:85},  Tue:{x:151,y:330,w:73,h:85}, Wed:{x:69,y:443,w:73,h:85},  Thu:{x:151,y:443,w:73,h:85}, Fri:{x:234,y:330,w:73,h:141}, Sat:{x:69,y:556,w:155,h:85}, Sun:{x:234,y:499,w:73,h:141} },
  Apple:    { Mon:{x:103,y:337,w:80,h:107}, Tue:{x:193,y:337,w:80,h:107}, Wed:{x:58,y:451,w:80,h:107}, Thu:{x:148,y:451,w:80,h:107}, Fri:{x:238,y:451,w:80,h:107}, Sat:{x:103,y:566,w:80,h:107}, Sun:{x:193,y:566,w:80,h:107} },
  Note:     { Mon:{x:105,y:350,w:74,h:98},  Tue:{x:183,y:350,w:73,h:98}, Wed:{x:73,y:452,w:74,h:99},  Thu:{x:151,y:452,w:73,h:99}, Fri:{x:228,y:452,w:74,h:98},  Sat:{x:105,y:555,w:74,h:98},  Sun:{x:183,y:555,w:73,h:98} },
  Spark:    { Mon:{x:125,y:373,w:59,h:79},  Tue:{x:192,y:373,w:59,h:79}, Wed:{x:92,y:457,w:59,h:79},  Thu:{x:158,y:457,w:59,h:79}, Fri:{x:225,y:457,w:59,h:79},  Sat:{x:125,y:542,w:59,h:79},  Sun:{x:192,y:542,w:59,h:79} },
  Star:     { Mon:{x:105,y:349,w:74,h:98},  Tue:{x:183,y:349,w:73,h:98}, Wed:{x:73,y:451,w:74,h:99},  Thu:{x:151,y:451,w:73,h:99}, Fri:{x:228,y:451,w:74,h:98},  Sat:{x:105,y:554,w:74,h:98},  Sun:{x:183,y:554,w:73,h:98} },
};

// ── 월별 그리드 컨테이너 영역 (좌상단 + 크기) ─────────────────
const MONTH_GRID: Record<WallpaperFrameStyle, CellRect> = {
  Default:  { x:40,  y:352, w:295, h:294 },
  Postcard: { x:40,  y:340, w:295, h:295 },
  Polaroid: { x:42,  y:356, w:295, h:290 },
  Apple:    { x:40,  y:380, w:294, h:275 },
  Note:     { x:55,  y:375, w:264, h:247 },
  Spark:    { x:41,  y:349, w:292, h:273 },
  Star:     { x:62,  y:397, w:251, h:235 },
};


type SvgLayer = { src: string; x: number; y: number; w: number; h: number };

// ── Postcard/Polaroid Month 셀 좌표 (피그마 정확 좌표 + rotation) ─────────
// 5th element = CSS rotation in degrees (Figma rotation field, converted from radians)
const POSTCARD_MONTH_CELLS: [number,number,number,number,number][] = [
  // Row 0 (days 1–7): rotation −3.724°, actual cell 35×46, position = bbox-center − half-actual-size
  [45,353,35,46,-3.724],[87,351,35,46,-3.724],[129,348,35,46,-3.724],[170,345,35,46,-3.724],
  [211,342,35,46,-3.724],[253,339,35,46,-3.724],[294,337,35,46,-3.724],
  // Row 1 (days 8–14): no rotation
  [45,408,35,46,0],[86,408,35,46,0],[128,408,35,46,0],[170,408,35,46,0],
  [211,408,35,46,0],[252,408,35,46,0],[294,408,35,46,0],
  // Row 2 (days 15–21): rotation +2.399°, actual cell 35×46
  [47,463,35,46,2.399],[89,465,35,46,2.399],[130,467,35,46,2.399],[172,469,35,46,2.399],
  [213,471,35,46,2.399],[254,473,35,46,2.399],[296,475,35,46,2.399],
  // Row 3 (days 22–28): no rotation
  [46,528,35,46,0],[88,528,35,46,0],[130,528,35,46,0],[171,528,35,46,0],
  [212,528,35,46,0],[254,528,35,46,0],[295,528,35,46,0],
  // Row 4 (days 29–31): no rotation
  [45,585,35,46,0],[86,585,35,46,0],[127,585,35,46,0],
];
const POLAROID_MONTH_X = [42,84,126,169,212,254,296];
const POLAROID_MONTH_Y = [356,417,478,539,600];

// Postcard Week Mon cell rotation (Figma rotation=-0.290129 rad = -16.623°)
const POSTCARD_MON_ROT = -16.623;

// ── 배경 레이어 (포토 셀 뒤쪽) ────────────────────────────────
function bgLayers(style: WallpaperFrameStyle, isWeek: boolean, bgColor: string, daysInMonth = 31): SvgLayer[] {
  const dark = bgColor === "#000000" || bgColor === "#232323";
  if (style === "Postcard")
    return [{ src: BASE+(isWeek ? "postcardWeek.svg" : `postcardMonth${daysInMonth}.svg`), x: isWeek?108:40, y: isWeek?308:332, w: isWeek?159:296, h: isWeek?366:302 }];
  if (style === "Polaroid")
    return [{ src: BASE+(isWeek ? "polaroidweek.svg" : `polaroidMonth${daysInMonth}.svg`), x: isWeek?66:40, y: isWeek?323:353, w: isWeek?244:295, h: isWeek?336:301 }];
  if (isWeek) {
    if (style === "Spark")  return [{ src: BASE+"sparkWeek.svg",                                          x:-119, y:-79,  w:613,  h:970  }];
    if (style === "Apple")  return [{ src: BASE+(dark ? "appleWeek-black-gray.svg" : "appleWeek-blue.svg"), x:-345, y:-54,  w:1065, h:921  }];
    if (style === "Note")   return [{ src: BASE+(dark ? "noteWeek-black-gray.svg"  : "noteWeek-blue.svg"),  x:-216, y:-289, w:848,  h:1391 }];
    if (style === "Star")   return [{ src: BASE+"starWeek.svg",  x:0, y:0, w:375, h:812 }];
  } else {
    if (style === "Spark")  return [{ src: BASE+"sparkMonth.svg",                                           x:0,    y:0,    w:375,  h:812  }];
    if (style === "Apple")  return [{ src: BASE+(dark ? "appleMonth-black-gray.svg": "appleMonth-blue.svg"), x:-332, y:-54,  w:1039, h:921  }];
    if (style === "Note")   return [{ src: BASE+(dark ? "noteMonth-black-gray.svg" : "noteMonth-blue.svg"),  x:-156, y:-212, w:724,  h:1236 }];
    if (style === "Star")   return [{ src: BASE+"starMonth.svg", x:0, y:0, w:375, h:812 }];
  }
  return [];
}

// ── 오버레이 레이어 (포토 셀 앞쪽) ───────────────────────────
function overlayLayers(style: WallpaperFrameStyle, isWeek: boolean): SvgLayer[] {
  if (style === "Default" && isWeek)
    return [{ src: BASE+"defaultWeekText.svg", x:113, y:427, w:218, h:232 }];
  return [];
}

// ── 자막 렌더링 ───────────────────────────────────────────────
const TEXT_BASE: React.CSSProperties = {
  fontFamily: "'Dongle', sans-serif",
  fontWeight: 400,
  lineHeight: "normal",
  whiteSpace: "nowrap",
  color: "#fff",
};

function renderSubtitle(
  frameStyle: WallpaperFrameStyle,
  isWeek: boolean,
  year: number,
  month: number,
  week: number | undefined,
  petName: string,
): React.ReactNode {
  if (frameStyle === "Apple" || frameStyle === "Note" || frameStyle === "Spark" || frameStyle === "Star") {
    return null;
  }

  const animal = <img src={ANIMAL_ICON} alt="" style={{ flexShrink: 0, pointerEvents: "none" }} />;

  if (frameStyle === "Default") {
    const y = isWeek ? 314 : 327;
    const text = isWeek
      ? `${year}년 ${month}월 ${week}주차 ${petName}. 오늘도 귀여웠어`
      : `${year}년 ${month}월 ${petName}. 오늘도 귀여웠어`;
    return (
      <div style={{ position: "absolute", left: 40, top: y, display: "flex", alignItems: "center", gap: 5, pointerEvents: "none" }}>
        <span style={{ ...TEXT_BASE, fontSize: 17 }}>{text}</span>
        <img src={ANIMAL_ICON} alt="" style={{ width: 15, height: 15, flexShrink: 0 }} />
      </div>
    );
  }

  if (frameStyle === "Polaroid") {
    if (isWeek) {
      const topText = `${year}년 ${month}월 ${week}주차 ${petName}. `;
      return (
        <>
          <div style={{ position: "absolute", left: 66, top: 293, pointerEvents: "none" }}>
            <span style={{ ...TEXT_BASE, fontSize: 17 }}>{topText}</span>
          </div>
          <div style={{ position: "absolute", left: 66, top: 664, display: "flex", alignItems: "center", gap: 5, pointerEvents: "none" }}>
            <span style={{ ...TEXT_BASE, fontSize: 17 }}>오늘도 귀여웠어</span>
            <img src={ANIMAL_ICON} alt="" style={{ width: 15, height: 15, flexShrink: 0 }} />
          </div>
        </>
      );
    }
    return (
      <div style={{ position: "absolute", left: 40, top: 324, display: "flex", alignItems: "center", gap: 5, pointerEvents: "none" }}>
        <span style={{ ...TEXT_BASE, fontSize: 17 }}>{`${year}년 ${month}월 ${petName}. 오늘도 귀여웠어`}</span>
        <img src={ANIMAL_ICON} alt="" style={{ width: 15, height: 15, flexShrink: 0 }} />
      </div>
    );
  }

  if (frameStyle === "Postcard") {
    if (isWeek) {
      return (
        <>
          <img src={ANIMAL_ICON} alt="" style={{ position: "absolute", left: 204, top: 599, width: 18, height: 18, pointerEvents: "none" }} />
          <div style={{ position: "absolute", left: 204, top: 622, width: 57, pointerEvents: "none" }}>
            <div style={{ ...TEXT_BASE, fontSize: 11, lineHeight: 0.96 }}>{year}년 {month}월</div>
            <div style={{ ...TEXT_BASE, fontSize: 11, lineHeight: 0.96 }}>{week}주차</div>
            <div style={{ ...TEXT_BASE, fontSize: 11, lineHeight: 0.96 }}>{petName} 오늘도 귀여웠어</div>
          </div>
        </>
      );
    }
    return (
      <div style={{ position: "absolute", left: 253, top: 598, display: "flex", alignItems: "flex-start", gap: 6, pointerEvents: "none" }}>
        <img src={ANIMAL_ICON} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
        <div>
          <div style={{ ...TEXT_BASE, fontSize: 11 }}>{year}년 {month}월</div>
          <div style={{ ...TEXT_BASE, fontSize: 11 }}>{petName} 오늘도 귀여웠어</div>
        </div>
      </div>
    );
  }

  return null;
}

// ── DayBadge ─────────────────────────────────────────────────
function DayBadge({ label, right, bottom }: { label: string; right: number; bottom: number }) {
  return (
    <div style={{
      position: "absolute", right, bottom,
      width: 16, height: 16, borderRadius: "50%",
      backgroundColor: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{
        fontFamily: "'Ownglyph PDH', sans-serif",
        fontSize: 11, lineHeight: 1, color: BADGE_TEXT_COLOR,
      }}>{label}</span>
    </div>
  );
}

// ── WallpaperFrame ────────────────────────────────────────────
export default function WallpaperFrame({
  type, frameStyle = "Default", previewContainer = true,
  photoMap, year, month, week, petName = "", bgColor = DEFAULT_BG,
}: WallpaperFrameProps) {
  const isWeek = type === "week";
  const showBadge = false;
  const effectiveBg = (frameStyle === "Note" && bgColor === "#508FE1") ? "#ffffff" : bgColor;
  const previewSrc = (frameStyle === "Note" && bgColor === "#508FE1") ? BASE+"PreviewContainer-black.svg" : BASE+"PreviewContainer.svg";

  const frame = (
    <div style={{
      width: 375, height: 812, backgroundColor: effectiveBg,
      position: "relative", overflow: "hidden",
      flexShrink: 0, boxSizing: "border-box",
    }}>

      {/* 1. 배경 SVG (포토 셀 뒤) */}
      {bgLayers(frameStyle, isWeek, effectiveBg, new Date(year, month, 0).getDate()).map((l, i) => (
        <img key={i} src={l.src} alt="" style={{ position:"absolute", left:l.x, top:l.y, width:l.w, height:l.h, display:"block", pointerEvents:"none" }} />
      ))}

      {/* 2. 포토 셀 */}
      {isWeek
        ? WEEK_DAYS.map(({ key, label }) => {
            const c = WEEK_CELLS[frameStyle][key];
            const src = photoMap?.[key];
            const cellRot = (frameStyle === "Postcard" && key === "Mon") ? POSTCARD_MON_ROT : 0;
            return (
              <div key={key} style={{
                position:"absolute", left:c.x, top:c.y, width:c.w, height:c.h,
                borderRadius: frameStyle === "Apple" ? 13 : (frameStyle === "Postcard" || frameStyle === "Polaroid") ? 0 : 8,
                backgroundColor: (frameStyle === "Postcard" || frameStyle === "Polaroid") ? "transparent" : (src ? effectiveBg : "#ffffff"),
                overflow:"hidden",
                transform: cellRot ? `rotate(${cellRot}deg)` : undefined,
                transformOrigin: "center",
              }}>
                {src && <img src={src} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", pointerEvents:"none" }} />}
                {showBadge && <DayBadge label={label} right={2} bottom={2} />}
              </div>
            );
          })
        : (() => {
            const imgStyle: React.CSSProperties = { position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", pointerEvents:"none" };
            const daysInMonth = new Date(year, month, 0).getDate();

            // Postcard Month: 피그마 정확 좌표 사용 (대각선 배치 + per-cell 회전)
            if (frameStyle === "Postcard") {
              return (
                <>
                  {POSTCARD_MONTH_CELLS.slice(0, daysInMonth).map(([x,y,w,h,rot], i) => {
                    const day = i + 1;
                    const src = photoMap?.[String(day)];
                    return (
                      <div key={day} style={{
                        position:"absolute", left:x, top:y, width:w, height:h, overflow:"hidden",
                        backgroundColor: src ? "transparent" : "#ffffff",
                        transform: rot ? `rotate(${rot}deg)` : undefined,
                        transformOrigin: "center",
                      }}>
                        {src && <img src={src} alt="" style={imgStyle} />}
                      </div>
                    );
                  })}
                </>
              );
            }

            // Polaroid Month: 피그마 정확 좌표 사용
            if (frameStyle === "Polaroid") {
              return (
                <>
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const col = i % 7;
                    const row = Math.floor(i / 7);
                    const day = i + 1;
                    const src = photoMap?.[String(day)];
                    return (
                      <div key={day} style={{ position:"absolute", left:POLAROID_MONTH_X[col], top:POLAROID_MONTH_Y[row], width:37, height:43, overflow:"hidden", backgroundColor: src ? "transparent" : "#ffffff" }}>
                        {src && <img src={src} alt="" style={imgStyle} />}
                      </div>
                    );
                  })}
                </>
              );
            }

            // 기본 그리드 방식
            const g = MONTH_GRID[frameStyle];
            const cw = g.w / 7;
            const ch = g.h / 5;
            return Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const src = photoMap?.[String(day)];
              return (
                <div key={day} style={{
                  position:"absolute",
                  left: g.x + (i % 7) * cw,
                  top:  g.y + Math.floor(i / 7) * ch,
                  width: cw, height: ch,
                  borderRadius: frameStyle === "Apple" ? 13 : 0,
                  backgroundColor: src ? effectiveBg : "#ffffff", overflow:"hidden",
                }}>
                  {src && <img src={src} alt="" style={imgStyle} />}
                </div>
              );
            });
          })()
      }

      {/* 3. 오버레이 SVG (포토 셀 앞) */}
      {overlayLayers(frameStyle, isWeek).map((l, i) => (
        <img key={i} src={l.src} alt="" style={{ position:"absolute", left:l.x, top:l.y, width:l.w, height:l.h, display:"block", pointerEvents:"none" }} />
      ))}

      {/* 4. 자막 텍스트 */}
      {renderSubtitle(frameStyle, isWeek, year, month, week, petName)}

      {/* 5. PreviewContainer (최상단) */}
      {previewContainer && (
        <img src={previewSrc} alt="" style={{ position:"absolute", inset:0, width:375, height:812, display:"block", pointerEvents:"none" }} />
      )}
    </div>
  );

  if (!previewContainer) {
    return (
      <div style={{ padding:50, boxSizing:"border-box", backgroundColor: effectiveBg }}>
        {frame}
      </div>
    );
  }
  return frame;
}
