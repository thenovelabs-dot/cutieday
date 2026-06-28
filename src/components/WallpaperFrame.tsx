import React, { memo } from "react";

const BASE = "/assets/wallpaperComponenet/";
const ANIMAL_ICON = "/assets/wallpaper/animal-icon.svg";
// TODO: TEMP — Balletcore 테스트용 더미 이미지, 검수 후 삭제
const DEFAULT_BG = "#5e96df";
const BADGE_TEXT_COLOR = "#375e92";
const KO_MONTHS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

export type WeekKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
const WEEK_DAYS: { key: WeekKey; label: string }[] = [
  { key: "Mon", label: "월" }, { key: "Tue", label: "화" },
  { key: "Wed", label: "수" }, { key: "Thu", label: "목" },
  { key: "Fri", label: "금" }, { key: "Sat", label: "토" },
  { key: "Sun", label: "일" },
];

type CellRect = { x: number; y: number; w: number; h: number };

export type WallpaperFrameStyle = "Default" | "Postcard" | "Polaroid" | "Apple" | "Note" | "Spark" | "Star" | "Balletcore" | "Heart" | "Vintage";
export const WALLPAPER_STYLES: WallpaperFrameStyle[] = [
  "Default", "Postcard", "Polaroid", "Apple", "Note", "Spark", "Star", "Heart", "Vintage", "Balletcore",
];

export interface WallpaperFrameProps {
  type: "week" | "month" | "day";
  frameStyle?: WallpaperFrameStyle;
  previewContainer?: boolean;
  photoMap?: Record<string, string>;
  year: number;
  month: number;
  week?: number;
  day?: number;
  petName?: string;
  previewDate?: Date;
  bgColor?: string;
}

// ── 주별 포토 셀 절대 좌표 (375×812 기준) ─────────────────────
export const WEEK_CELLS: Record<WallpaperFrameStyle, Record<WeekKey, CellRect>> = {
  Default:   { Mon:{x:40,y:345,w:96,h:104}, Tue:{x:139,y:345,w:96,h:104}, Wed:{x:40,y:453,w:96,h:104}, Thu:{x:139,y:453,w:96,h:104}, Fri:{x:239,y:345,w:96,h:157}, Sat:{x:40,y:560,w:196,h:104}, Sun:{x:239,y:506,w:96,h:157} },
  Postcard:  { Mon:{x:125,y:322,w:57,h:76}, Tue:{x:204,y:333,w:58,h:76}, Wed:{x:136,y:419,w:58,h:76}, Thu:{x:204,y:419,w:58,h:76}, Fri:{x:136,y:506,w:58,h:76}, Sat:{x:204,y:506,w:58,h:76}, Sun:{x:136,y:593,w:58,h:76} },
  Polaroid:  { Mon:{x:69,y:330,w:73,h:85},  Tue:{x:151,y:330,w:73,h:85}, Wed:{x:69,y:443,w:73,h:85},  Thu:{x:151,y:443,w:73,h:85}, Fri:{x:234,y:330,w:73,h:141}, Sat:{x:69,y:556,w:155,h:85}, Sun:{x:234,y:499,w:73,h:141} },
  Apple:     { Mon:{x:103,y:337,w:80,h:107}, Tue:{x:193,y:337,w:80,h:107}, Wed:{x:58,y:451,w:80,h:107}, Thu:{x:148,y:451,w:80,h:107}, Fri:{x:238,y:451,w:80,h:107}, Sat:{x:103,y:566,w:80,h:107}, Sun:{x:193,y:566,w:80,h:107} },
  Note:      { Mon:{x:105,y:350,w:74,h:98},  Tue:{x:183,y:350,w:73,h:98}, Wed:{x:73,y:452,w:74,h:99},  Thu:{x:151,y:452,w:73,h:99}, Fri:{x:228,y:452,w:74,h:98},  Sat:{x:105,y:555,w:74,h:98},  Sun:{x:183,y:555,w:73,h:98} },
  Spark:     { Mon:{x:125,y:373,w:59,h:79},  Tue:{x:192,y:373,w:59,h:79}, Wed:{x:92,y:457,w:59,h:79},  Thu:{x:158,y:457,w:59,h:79}, Fri:{x:225,y:457,w:59,h:79},  Sat:{x:125,y:542,w:59,h:79},  Sun:{x:192,y:542,w:59,h:79} },
  Star:      { Mon:{x:105,y:349,w:74,h:98},  Tue:{x:183,y:349,w:73,h:98}, Wed:{x:73,y:451,w:74,h:99},  Thu:{x:151,y:451,w:73,h:99}, Fri:{x:228,y:451,w:74,h:98},  Sat:{x:105,y:554,w:74,h:98},  Sun:{x:183,y:554,w:73,h:98} },
  Balletcore:{ Sun:{x:85,y:321,w:100,h:100}, Mon:{x:191,y:321,w:100,h:100}, Tue:{x:32,y:427,w:100,h:100}, Wed:{x:138,y:427,w:100,h:100}, Thu:{x:244,y:427,w:100,h:100}, Fri:{x:85,y:533,w:100,h:100}, Sat:{x:191,y:533,w:100,h:100} },
  Heart:     { Sun:{x:75.51,y:304.09,w:110,h:110}, Mon:{x:189.51,y:304.09,w:110,h:110}, Tue:{x:16.79,y:418.09,w:110,h:110}, Wed:{x:130.79,y:418.09,w:110,h:110}, Thu:{x:244.79,y:418.09,w:110,h:110}, Fri:{x:75.51,y:532.09,w:110,h:110}, Sat:{x:189.51,y:532.09,w:110,h:110} },
  Vintage:   { Sun:{x:75.51,y:304.09,w:110,h:110}, Mon:{x:189.51,y:304.09,w:110,h:110}, Tue:{x:16.79,y:418.09,w:110,h:110}, Wed:{x:130.79,y:418.09,w:110,h:110}, Thu:{x:244.79,y:418.09,w:110,h:110}, Fri:{x:75.51,y:532.09,w:110,h:110}, Sat:{x:189.51,y:532.09,w:110,h:110} },
};

// ── 월별 그리드 컨테이너 영역 (좌상단 + 크기) ─────────────────
export const MONTH_GRID: Record<WallpaperFrameStyle, CellRect> = {
  Default:    { x:40,  y:352, w:295,    h:294 },
  Postcard:   { x:40,  y:340, w:295,    h:295 },
  Polaroid:   { x:42,  y:356, w:295,    h:290 },
  Apple:      { x:40,  y:380, w:294,    h:275 },
  Note:       { x:55,  y:375, w:264,    h:247 },
  Spark:      { x:41,  y:349, w:292,    h:273 },
  Star:       { x:62,  y:397, w:251,    h:235 },
  Balletcore: { x:29,  y:333, w:317.52, h:297 },
  Heart:      { x:19,  y:295, w:336,    h:339 },
  Vintage:    { x:19.5, y:332, w:336,   h:270 },
};

// ── Balletcore 월별 그리드 (일수별, 피그마 ImageContainer 기준) ─────────────
export const BALLET_MONTH_GRIDS: Record<28|30|31, CellRect> = {
  28: { x:29, y:346, w:317.52, h:237.6 },
  30: { x:29, y:333, w:317.52, h:297 },
  31: { x:29, y:333, w:317.52, h:297 },
};
export function balletMonthVariant(days: number): 28|30|31 {
  if (days <= 28) return 28;
  if (days <= 30) return 30;
  return 31;
}

// ── Heart 월별 셀 좌표 배열 (375×812 프레임 기준, w:48 h:54 고정) ─────────
type HeartCellPos = { x: number; y: number };
export const HEART_MONTH_CELLS: Record<28|30|31, HeartCellPos[]> = {
  31: [
    {x:43.5,y:295},{x:91.5,y:295},{x:235.5,y:295},{x:283.5,y:295},
    {x:19.5,y:349},{x:67.5,y:349},{x:115.5,y:349},{x:211.5,y:349},{x:259.5,y:349},{x:307.5,y:349},
    {x:19.5,y:403},{x:67.5,y:403},{x:115.5,y:403},{x:163.5,y:403},{x:211.5,y:403},{x:259.5,y:403},{x:307.5,y:403},
    {x:43.5,y:457},{x:91.5,y:457},{x:139.5,y:457},{x:187.5,y:457},{x:235.5,y:457},{x:283.5,y:457},
    {x:67.5,y:511},{x:115.5,y:511},{x:163.5,y:511},{x:211.5,y:511},{x:259.5,y:511},
    {x:115.5,y:565},{x:163.5,y:565},{x:211.5,y:565},
  ],
  30: [
    {x:43.5,y:295},{x:91.5,y:295},{x:235.5,y:295},{x:283.5,y:295},
    {x:19.5,y:349},{x:67.5,y:349},{x:115.5,y:349},{x:211.5,y:349},{x:259.5,y:349},{x:307.5,y:349},
    {x:19.5,y:403},{x:67.5,y:403},{x:115.5,y:403},{x:163.5,y:403},{x:211.5,y:403},{x:259.5,y:403},{x:307.5,y:403},
    {x:43.5,y:457},{x:91.5,y:457},{x:139.5,y:457},{x:187.5,y:457},{x:235.5,y:457},{x:283.5,y:457},
    {x:67.5,y:511},{x:115.5,y:511},{x:163.5,y:511},{x:211.5,y:511},{x:259.5,y:511},
    {x:139.5,y:565},{x:187.5,y:565},
  ],
  28: [
    {x:43.5,y:310},{x:91.5,y:310},{x:235.5,y:310},{x:283.5,y:310},
    {x:19.5,y:364},{x:67.5,y:364},{x:115.5,y:364},{x:211.5,y:364},{x:259.5,y:364},{x:307.5,y:364},
    {x:19.5,y:418},{x:67.5,y:418},{x:115.5,y:418},{x:163.5,y:418},{x:211.5,y:418},{x:259.5,y:418},{x:307.5,y:418},
    {x:43.5,y:472},{x:91.5,y:472},{x:139.5,y:472},{x:187.5,y:472},{x:235.5,y:472},{x:283.5,y:472},
    {x:91,y:526},{x:139,y:526},{x:187,y:526},{x:235,y:526},
    {x:163,y:580},
  ],
};
export function heartMonthVariant(days: number): 28|30|31 {
  if (days <= 28) return 28;
  if (days <= 30) return 30;
  return 31;
}

// ── Vintage 월별 그리드 (일수별, 피그마 ImageContainer 기준) ─────────────────
export const VINTAGE_MONTH_GRIDS: Record<28|30|31, CellRect> = {
  28: { x:19.5, y:352, w:336, h:216 },
  30: { x:19.5, y:332, w:336, h:270 },
  31: { x:19.5, y:332, w:336, h:270 },
};
export function vintageMonthVariant(days: number): 28|30|31 {
  if (days <= 28) return 28;
  if (days <= 30) return 30;
  return 31;
}


export type SvgLayer = { src: string; x: number; y: number; w: number; h: number; rot?: number };

// ── Postcard/Polaroid Month 셀 좌표 (피그마 정확 좌표 + rotation) ─────────
// 5th element = CSS rotation in degrees (Figma rotation field, converted from radians)
export const POSTCARD_MONTH_CELLS: [number,number,number,number,number][] = [
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
export const POLAROID_MONTH_X = [42,84,126,169,212,254,296];
export const POLAROID_MONTH_Y = [356,417,478,539,600];

// Postcard Week Mon cell rotation (Figma rotation=-0.290129 rad = -16.623°)
export const POSTCARD_MON_ROT = -16.623;

// ── Day 전용: 단일 포토 셀 좌표 ──────────────────────────────
export const DAY_CELL: Record<WallpaperFrameStyle, CellRect> = {
  Default:    { x:40,  y:343, w:295, h:319 },
  Postcard:   { x:74,  y:286, w:183, h:241 },
  Polaroid:   { x:58,  y:302, w:258, h:301 },
  Apple:      { x:60,  y:299, w:256, h:342 },
  Note:       { x:30,  y:356, w:315, h:296 },
  Spark:      { x:92,  y:375, w:191, h:242 },
  Star:       { x:46,  y:329, w:283, h:283 },
  Balletcore: { x:48,  y:338, w:271, h:271 },
  Heart:      { x:27,  y:305, w:315, h:315 },
  Vintage:    { x:38,  y:321, w:300, h:300 },
};
export const DAY_POSTCARD_ROT = -15.32;

// ── Day 전용 배경 레이어 ──────────────────────────────────────
export function bgLayersDay(style: WallpaperFrameStyle, bgColor: string): SvgLayer[] {
  const dark = bgColor === "#000000" || bgColor === "#232323";
  if (style === "Postcard")   return [{ src: BASE+"postcardDay.png",  x:23,   y:245,  w:321,  h:451  }];
  if (style === "Polaroid")   return [{ src: BASE+"polaroidDay.png",  x:48,   y:283,  w:279,  h:388  }];
  if (style === "Apple")      return [{ src: BASE+(dark ? "appleDay-black.png" : "appleDay-blue.png"), x:-345, y:-54, w:1065, h:921 }];
  if (style === "Note")       return [{ src: BASE+(dark ? "noteDay-black.png"  : "noteDay-blue.png"),  x:-216, y:-289, w:848, h:1391 }];
  if (style === "Spark")      return [{ src: BASE+"sparkDay.png",     x:-119, y:-79,  w:613,  h:970  }];
  if (style === "Star")       return [{ src: BASE+"starDay.png",      x:0,    y:0,    w:375,  h:812  }];
  if (style === "Balletcore") return [{ src: BASE+"balletcoreDay.png", x:-76, y:-106, w:527,  h:1025 }];
  if (style === "Heart")      return [{ src: BASE+"heart.png",         x:-100, y:-101, w:575,  h:1014 }];
  if (style === "Vintage")    return [{ src: BASE+"vintageDay.png",    x:-81,  y:-33,  w:538,  h:877  }];
  return [];
}

// ── 배경 레이어 (포토 셀 뒤쪽) ────────────────────────────────
export function bgLayers(style: WallpaperFrameStyle, isWeek: boolean, bgColor: string, daysInMonth = 31): SvgLayer[] {
  const dark = bgColor === "#000000" || bgColor === "#232323";
  if (style === "Postcard")
    return [{ src: BASE+(isWeek ? "postcardWeek.png" : `postcardMonth${daysInMonth}.png`), x: isWeek?108:40, y: isWeek?308:332, w: isWeek?159:296, h: isWeek?366:302 }];
  if (style === "Polaroid")
    return [{ src: BASE+(isWeek ? "polaroidweek.png" : `polaroidMonth${daysInMonth}.png`), x: isWeek?66:40, y: isWeek?323:353, w: isWeek?244:295, h: isWeek?336:301 }];
  if (style === "Balletcore") {
    const monthPng = isWeek ? "balletcoreWeek.png" : `balletcoreMonth${balletMonthVariant(daysInMonth)}.png`;
    return [{ src: BASE+monthPng, x:-76, y:-106, w:527, h:1025 }];
  }
  if (style === "Heart") return [{ src: BASE+"heart.png", x:-100, y:-101, w:575, h:1014 }];
  if (style === "Vintage") {
    const png = isWeek ? "vintageWeek.png" : `vintageMonth${vintageMonthVariant(daysInMonth)}.png`;
    return [{ src: BASE+png, x:-81, y:-33, w:538, h:877 }];
  }
  if (isWeek) {
    if (style === "Spark")  return [{ src: BASE+"sparkWeek.png",                                          x:-119, y:-79,  w:613,  h:970  }];
    if (style === "Apple")  return [{ src: BASE+(dark ? "appleWeek-black-gray.png" : "appleWeek-blue.png"), x:-345, y:-54,  w:1065, h:921  }];
    if (style === "Note")   return [{ src: BASE+(dark ? "noteWeek-black-gray.png"  : "noteWeek-blue.png"),  x:-216, y:-289, w:848,  h:1391 }];
    if (style === "Star")   return [{ src: BASE+"starWeek.png",  x:0, y:0, w:375, h:812 }];
  } else {
    if (style === "Spark")  return [{ src: BASE+"sparkMonth.png",                                           x:0,    y:0,    w:375,  h:812  }];
    if (style === "Apple")  return [{ src: BASE+(dark ? "appleMonth-black-gray.png": "appleMonth-blue.png"), x:-332, y:-54,  w:1039, h:921  }];
    if (style === "Note")   return [{ src: BASE+(dark ? "noteMonth-black-gray.png" : "noteMonth-blue.png"),  x:-156, y:-212, w:724,  h:1236 }];
    if (style === "Star")   return [{ src: BASE+"starMonth.png", x:0, y:0, w:375, h:812 }];
  }
  return [];
}

// ── 오버레이 레이어 (포토 셀 앞쪽) ───────────────────────────
export function overlayLayers(style: WallpaperFrameStyle, isWeek: boolean): SvgLayer[] {
  if (style === "Default" && isWeek)
    return [{ src: BASE+"defaultWeekText.png", x:113, y:427, w:218, h:232 }];
  return [];
}

// ── Vintage 스트리머 오버레이 (포토 셀 위) ───────────────────
// Day/Week: streamer1.png, Month: streamer2.png (피그마 정확 좌표 + 회전)
export function vintageOverlays(type: "day" | "week" | "month", daysInMonth = 31): SvgLayer[] {
  if (type === "day") {
    // -translate-x-1/2, left=calc(50%+0.5px)=188, top=271, w=166, h=111 → actual left=105
    return [{ src: BASE+"streamer1.png", x:105, y:271, w:166, h:111 }];
  }
  if (type === "week") {
    // 두 개 모두 rotate(-30deg), 중심 좌표에서 이미지 top-left 역산
    return [
      { src: BASE+"streamer1.png", x:12.73,  y:260.98, w:146.232, h:98.117, rot:-30 },
      { src: BASE+"streamer1.png", x:225.71, y:589.89, w:146.232, h:98.117, rot:-30 },
    ];
  }
  // streamer2.png 실제 크기: 107×58px (피그마 outer wrapper bbox 기준 위치)
  // 31/30일: wrapper(left=-37,top=283), (left=279,top=513) → center계산 후 역산
  // 28일: inner container top이 +20px씩 이동 → wrapper top도 +20
  const is28 = vintageMonthVariant(daysInMonth) === 28;
  return [
    { src: BASE+"streamer2.png", x:-29.8, y: is28 ? 325.65 : 305.65, w:107, h:58, rot:-30 },
    { src: BASE+"streamer2.png", x:286.2, y: is28 ? 555.65 : 535.65, w:107, h:58, rot:-30 },
  ];
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
  if (frameStyle === "Apple" || frameStyle === "Note" || frameStyle === "Spark" || frameStyle === "Star" || frameStyle === "Balletcore" || frameStyle === "Heart" || frameStyle === "Vintage") {
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
            <div style={{ ...TEXT_BASE, fontSize: 11, lineHeight: 0.96 }}>{petName}</div>
            <div style={{ ...TEXT_BASE, fontSize: 11, lineHeight: 0.96 }}>오늘도 귀여웠어</div>
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

// ── Day 자막 렌더링 ────────────────────────────────────────────
function renderSubtitleDay(
  frameStyle: WallpaperFrameStyle,
  year: number,
  month: number,
  day: number,
  petName: string,
  bgColor: string,
): React.ReactNode {
  if (["Apple", "Note", "Spark", "Star", "Balletcore", "Heart", "Vintage"].includes(frameStyle)) return null;

  if (frameStyle === "Default") {
    const text = `${year}년 ${month}월 ${day}일 ${petName}. 오늘도 귀여웠어`;
    return (
      <div style={{ position: "absolute", left: 40, top: 316, width: 295, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, pointerEvents: "none" }}>
        <span style={{ ...TEXT_BASE, fontSize: 17 }}>{text}</span>
        <img src={ANIMAL_ICON} alt="" style={{ width: 15, height: 15, flexShrink: 0 }} />
      </div>
    );
  }

  if (frameStyle === "Polaroid") {
    const dark = bgColor === "#000000" || bgColor === "#232323";
    const POLAROID_TEXT = dark ? "#000000" : "#5e96df";
    return (
      <div style={{ position: "absolute", left: 58.31, top: 615.03, width: 257.802, display: "flex", flexDirection: "column", alignItems: "flex-start", pointerEvents: "none" }}>
        <p style={{ margin: 0, fontFamily: "'Dongle', sans-serif", fontWeight: 400, fontSize: 19.763, lineHeight: "normal", color: POLAROID_TEXT, textAlign: "center", width: "100%" }}>
          {year}년 {month}월 {day}일 {petName}.
        </p>
        <div style={{ display: "flex", gap: 5.729, alignItems: "center", justifyContent: "center", width: "100%" }}>
          <span style={{ fontFamily: "'Dongle', sans-serif", fontWeight: 400, fontSize: 14.895, lineHeight: "normal", color: POLAROID_TEXT, whiteSpace: "nowrap" }}>오늘도 귀여웠어</span>
          <img src={ANIMAL_ICON} alt="" style={{ width: 16.041, height: 16.041, flexShrink: 0 }} />
        </div>
      </div>
    );
  }

  if (frameStyle === "Postcard") {
    return (
      <div style={{
        position: "absolute", left: 185, top: 531, width: 121, height: 136,
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
        <div style={{
          display: "flex", flexDirection: "column", gap: 8.78, alignItems: "flex-start",
          transform: "rotate(13.22deg)", flexShrink: 0,
        }}>
          <img src={ANIMAL_ICON} alt="" style={{ width: 30.544, height: 30.544 }} />
          <div>
            <div style={{ ...TEXT_BASE, fontSize: 19.286, lineHeight: "19.286px" }}>{year}년</div>
            <div style={{ ...TEXT_BASE, fontSize: 19.286, lineHeight: "19.286px" }}>{month}월 {day}일</div>
            <div style={{ ...TEXT_BASE, fontSize: 19.286, lineHeight: "19.286px" }}>{petName}</div>
            <div style={{ ...TEXT_BASE, fontSize: 19.286, lineHeight: "19.286px" }}>오늘도 귀여웠어</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ── WallpaperFrame ────────────────────────────────────────────
function WallpaperFrame({
  type, frameStyle = "Default", previewContainer = true,
  photoMap, year, month, week, day, petName = "", bgColor = DEFAULT_BG,
}: WallpaperFrameProps) {
  const isWeek = type === "week";
  const showBadge = false;
  const effectiveBg = frameStyle === "Balletcore" ? "#ffeff4" : frameStyle === "Heart" ? "#fffbfb" : frameStyle === "Vintage" ? "#c2b19a" : (frameStyle === "Note" && bgColor === "#508FE1") ? "#ffffff" : bgColor;
  const previewSrc = (frameStyle === "Balletcore" || frameStyle === "Heart" || frameStyle === "Vintage" || (frameStyle === "Note" && bgColor === "#508FE1")) ? BASE+"PreviewContainer-black.png" : BASE+"PreviewContainer.png";

  const frame = (
    <div style={{
      width: 375, height: 812, backgroundColor: effectiveBg,
      position: "relative", overflow: "hidden",
      flexShrink: 0, boxSizing: "border-box",
    }}>

      {/* 1. 배경 PNG (포토 셀 뒤) */}
      {(type === "day"
        ? bgLayersDay(frameStyle, effectiveBg)
        : bgLayers(frameStyle, isWeek, effectiveBg, new Date(year, month, 0).getDate())
      ).map((l, i) => (
        <img key={i} src={l.src} alt="" style={{ position:"absolute", left:l.x, top:l.y, width:l.w, height:l.h, display:"block", pointerEvents:"none" }} />
      ))}

      {/* 2. 포토 셀 */}
      {type === "day"
        ? (() => {
            const c = DAY_CELL[frameStyle];
            const rawSrc = photoMap?.["photo"];
            const src = rawSrc;
            const cellRot = frameStyle === "Postcard" ? DAY_POSTCARD_ROT : 0;
            const isBallet = frameStyle === "Balletcore";
            const isHeart = frameStyle === "Heart";
            const isVintage = frameStyle === "Vintage";
            const br = isHeart ? 32 : isBallet ? 40 : isVintage ? 5 : frameStyle === "Apple" ? 38 : frameStyle === "Note" ? 36 : frameStyle === "Spark" ? 9999 : frameStyle === "Star" ? 12 : (frameStyle === "Postcard" || frameStyle === "Polaroid") ? 0 : 8;
            return (
              <div style={{
                position:"absolute", left:c.x, top:c.y, width:c.w, height:c.h,
                borderRadius: br,
                backgroundColor: isBallet ? undefined : (frameStyle === "Postcard" || frameStyle === "Polaroid") ? "transparent" : (src ? effectiveBg : "#ffffff"),
                overflow: isBallet ? undefined : "hidden",
                transform: cellRot ? `rotate(${cellRot}deg)` : undefined,
                transformOrigin: "center",
              }}>
                {src && <img src={src} alt="" crossOrigin="anonymous" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", borderRadius: isBallet ? br : undefined, pointerEvents:"none" }} />}
              </div>
            );
          })()
        : isWeek
        ? WEEK_DAYS.map(({ key, label }) => {
            const c = WEEK_CELLS[frameStyle][key];
            const rawSrc = photoMap?.[key];
            const src = rawSrc;
            const cellRot = (frameStyle === "Postcard" && key === "Mon") ? POSTCARD_MON_ROT : 0;
            const isBallet = frameStyle === "Balletcore";
            const isHeart = frameStyle === "Heart";
            const isVintage = frameStyle === "Vintage";
            const br = isHeart ? 16 : isBallet ? 12 : isVintage ? 3 : frameStyle === "Apple" ? 13 : (frameStyle === "Postcard" || frameStyle === "Polaroid") ? 0 : 8;
            return (
              <div key={key} style={{
                position:"absolute", left:c.x, top:c.y, width:c.w, height:c.h,
                borderRadius: br,
                backgroundColor: (isBallet || isVintage) ? undefined : (frameStyle === "Postcard" || frameStyle === "Polaroid") ? "transparent" : (src ? effectiveBg : "#ffffff"),
                overflow: isBallet ? undefined : "hidden",
                transform: cellRot ? `rotate(${cellRot}deg)` : undefined,
                transformOrigin: "center",
              }}>
                {src && <img src={src} alt="" crossOrigin="anonymous" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", borderRadius: isBallet ? br : undefined, pointerEvents:"none" }} />}
                {showBadge && <DayBadge label={label} right={2} bottom={2} />}
              </div>
            );
          })
        : (() => {
            const imgStyle: React.CSSProperties & { crossOrigin?: string } = { position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", pointerEvents:"none" };
          const imgProps = { style: imgStyle, alt: "", crossOrigin: "anonymous" as const };
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
                        {src && <img src={src} {...imgProps} />}
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
                        {src && <img src={src} {...imgProps} />}
                      </div>
                    );
                  })}
                </>
              );
            }

            // Heart Month: 하트 모양 고정 좌표 배열
            if (frameStyle === "Heart") {
              const variant = heartMonthVariant(daysInMonth);
              const heartCells = HEART_MONTH_CELLS[variant];
              return heartCells.slice(0, daysInMonth).map((pos, i) => {
                const dayNum = i + 1;
                const src = photoMap?.[String(dayNum)];
                return (
                  <div key={dayNum} style={{ position:"absolute", left:pos.x, top:pos.y, width:48, height:54, borderRadius:6, overflow:"hidden" }}>
                    {src && <img src={src} alt="" crossOrigin="anonymous" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", pointerEvents:"none" }} />}
                  </div>
                );
              });
            }

            // Vintage Month: 균일 그리드, 마지막 행 가운데 정렬
            if (frameStyle === "Vintage") {
              const g = VINTAGE_MONTH_GRIDS[vintageMonthVariant(daysInMonth)];
              const cw = g.w / 7; // 48
              const rows = Math.ceil(daysInMonth / 7);
              const ch = g.h / rows; // 54
              const lastRowCount = daysInMonth - (rows - 1) * 7;
              return Array.from({ length: daysInMonth }, (_, i) => {
                const dayNum = i + 1;
                const src = photoMap?.[String(dayNum)];
                const row = Math.floor(i / 7);
                const col = i % 7;
                const xOffset = (row === rows - 1 && lastRowCount < 7)
                  ? (g.w - lastRowCount * cw) / 2
                  : 0;
                return (
                  <div key={dayNum} style={{
                    position:"absolute",
                    left: g.x + xOffset + col * cw,
                    top:  g.y + row * ch,
                    width: cw, height: ch,
                    borderRadius: 2,
                    overflow: "hidden",
                  }}>
                    <img src={src} alt="" crossOrigin="anonymous" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", pointerEvents:"none" }} />
                  </div>
                );
              });
            }

            // 기본 그리드 방식
            const g = frameStyle === "Balletcore"
              ? BALLET_MONTH_GRIDS[balletMonthVariant(daysInMonth)]
              : MONTH_GRID[frameStyle];
            const cw = g.w / 7;
            const rows = frameStyle === "Balletcore" ? Math.ceil(daysInMonth / 7) : 5;
            const ch = g.h / rows;
            const lastRowCount = daysInMonth - (rows - 1) * 7;
            return Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const rawSrc = photoMap?.[String(day)];
              const src = rawSrc;
              const isBallet = frameStyle === "Balletcore";
              const br = isBallet ? 4.81 : frameStyle === "Apple" ? 13 : 0;
              const row = Math.floor(i / 7);
              const col = i % 7;
              const xOffset = (isBallet && row === rows - 1 && lastRowCount < 7)
                ? (g.w - lastRowCount * cw) / 2
                : 0;
              return (
                <div key={day} style={{
                  position:"absolute",
                  left: g.x + xOffset + col * cw,
                  top:  g.y + row * ch,
                  width: cw, height: ch,
                  borderRadius: br,
                  backgroundColor: isBallet ? undefined : (src ? effectiveBg : "#ffffff"),
                  overflow: isBallet ? undefined : "hidden",
                }}>
                  {src && <img src={src} alt="" style={{ ...imgStyle, borderRadius: isBallet ? br : undefined }} />}
                </div>
              );
            });
          })()
      }

      {/* 3. 오버레이 SVG (포토 셀 앞) */}
      {type !== "day" && overlayLayers(frameStyle, isWeek).map((l, i) => (
        <img key={i} src={l.src} alt="" style={{ position:"absolute", left:l.x, top:l.y, width:l.w, height:l.h, display:"block", pointerEvents:"none", ...(l.rot ? { transform:`rotate(${l.rot}deg)`, transformOrigin:"center" } : {}) }} />
      ))}
      {/* Vintage 스트리머 오버레이 */}
      {frameStyle === "Vintage" && (() => {
        const vType = type === "day" ? "day" : isWeek ? "week" : "month";
        const daysInMonth = new Date(year, month, 0).getDate();
        return vintageOverlays(vType, daysInMonth).map((l, i) => (
          <img key={`vs${i}`} src={l.src} alt="" style={{ position:"absolute", left:l.x, top:l.y, width:l.w, height:l.h, display:"block", pointerEvents:"none", ...(l.rot ? { transform:`rotate(${l.rot}deg)`, transformOrigin:"center" } : {}) }} />
        ));
      })()}

      {/* 4. 자막 텍스트 */}
      {type === "day"
        ? renderSubtitleDay(frameStyle, year, month, day ?? 1, petName, effectiveBg)
        : renderSubtitle(frameStyle, isWeek, year, month, week, petName)
      }

      {/* 5. PreviewContainer (최상단) */}
      {previewContainer && (
        <img src={previewSrc} alt="" style={{ position:"absolute", inset:0, width:375, height:812, display:"block", pointerEvents:"none" }} />
      )}
    </div>
  );

  if (!previewContainer) {
    return frame;
  }
  return frame;
}

export default memo(WallpaperFrame);
