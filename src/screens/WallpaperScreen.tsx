import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigation } from "../lib/navigation";
import { supabase } from "../lib/supabase";
import SegmentText from "../components/SegmentText";
import WallpaperFrame from "../components/WallpaperFrame";
import ColorSelectUnit from "../components/ColorSelectUnit";
import CalendarMonthPicker from "../components/CalendarMonthPicker";
import CalendarWeekPicker from "../components/CalendarWeekPicker";

type WallpaperType = "Week" | "Month";
type WallpaperColor = "Blue" | "Black" | "Gray";

// 활성 아이템: 195×422 / 비활성: 176×381, top 20px 아래
const ACTIVE_W = 195;
const ACTIVE_H = 422;
const INACTIVE_W = 176;
const INACTIVE_H = 381;
const INACTIVE_TOP = 20;
const GAP = 12;
// 아이템이 정중앙에 오도록 좌우 패딩: (375 - 195) / 2 = 90
const CAROUSEL_PAD = (375 - ACTIVE_W) / 2; // 90
// 스크롤 한 칸 = 아이템 너비 + 갭
const SLOT_PITCH = ACTIVE_W + GAP; // 207
const ACTIVE_SCALE = ACTIVE_W / 375;
// 비활성 아이템의 CSS scale 값 (195 → 176)
const INACTIVE_VISUAL_SCALE = INACTIVE_W / ACTIVE_W; // ≈ 0.903

const GRADIENT_TOP = "/assets/wallpaper/gradient-top.png";

const WALLPAPER_TYPES: WallpaperType[] = ["Week", "Month"];

const COLOR_OPTIONS: { key: WallpaperColor; color: "Brand" | "Black" | "Gray"; bg: string }[] = [
  { key: "Blue",  color: "Brand", bg: "#508FE1" },
  { key: "Black", color: "Black", bg: "#000000" },
  { key: "Gray",  color: "Gray",  bg: "#232323" },
];

function getWeekOfMonth(y: number, m: number, w: number) {
  const firstDayOffset = new Date(y, m - 1, 1).getDay();
  return new Date(y, m - 1, 1 - firstDayOffset + (w - 1) * 7);
}

function weeksInMonth(year: number, month: number): number {
  const firstDayOffset = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  return Math.ceil((daysInMonth + firstDayOffset) / 7);
}

function dateLabelParts(
  type: WallpaperType,
  monthInfo: { year: number; month: number },
  weekInfo: { year: number; month: number; week: number },
  currentYear: number,
): { main: string; sub?: string } {
  if (type === "Month") {
    const prefix = monthInfo.year !== currentYear ? `${monthInfo.year}년 ` : "";
    return { main: `${prefix}${monthInfo.month}월` };
  }
  const prefix = weekInfo.year !== currentYear ? `${weekInfo.year}년 ` : "";
  return { main: `${prefix}${weekInfo.month}월`, sub: `${weekInfo.week}주차` };
}

function buildWeekPhotoMap(
  photos: { date: string; image_url: string }[],
  weekStart: Date,
): Record<string, string> {
  const DAY_KEYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const map: Record<string, string> = {};
  photos.forEach(({ date, image_url }) => {
    const d = new Date(date + "T00:00:00");
    const diff = Math.round((d.getTime() - weekStart.getTime()) / 86400000);
    if (diff >= 0 && diff < 7) map[DAY_KEYS[d.getDay()]] = image_url;
  });
  return map;
}

function buildMonthPhotoMap(photos: { date: string; image_url: string }[]): Record<string, string> {
  const map: Record<string, string> = {};
  photos.forEach(({ date, image_url }) => {
    const day = parseInt(date.split("-")[2], 10);
    map[String(day)] = image_url;
  });
  return map;
}

export default function WallpaperScreen() {
  const { current, navigate } = useNavigation();
  const params = current.params as { initialType?: WallpaperType } | undefined;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentWeekNum = (() => {
    const firstDayOffset = new Date(currentYear, today.getMonth(), 1).getDay();
    return Math.ceil((today.getDate() + firstDayOffset) / 7);
  })();

  const [wallpaperType, setWallpaperType] = useState<WallpaperType>(
    params?.initialType ?? "Week"
  );
  const [selectedColor, setSelectedColor] = useState<WallpaperColor>("Blue");
  const [showPicker, setShowPicker] = useState(false);
  const [monthInfo, setMonthInfo] = useState({ year: currentYear, month: currentMonth });
  const [weekInfo, setWeekInfo] = useState({ year: currentYear, month: currentMonth, week: currentWeekNum });
  const [weekPhotoMap, setWeekPhotoMap] = useState<Record<string, string>>({});
  const [monthPhotoMap, setMonthPhotoMap] = useState<Record<string, string>>({});
  const [petName, setPetName] = useState("");

  const carouselRef = useRef<HTMLDivElement>(null);
  // 스크롤 위치(0~SLOT_PITCH)를 실시간으로 추적해 style 계산에 사용
  const [scrollX, setScrollX] = useState(
    () => WALLPAPER_TYPES.indexOf(wallpaperType) * SLOT_PITCH,
  );

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("pets").select("name").limit(1).single();
      if (data) setPetName(data.name);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const weekStart = getWeekOfMonth(weekInfo.year, weekInfo.month, weekInfo.week);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const { data } = await supabase
        .from("daily_photos")
        .select("date, image_url")
        .gte("date", fmt(weekStart))
        .lte("date", fmt(weekEnd));
      setWeekPhotoMap(buildWeekPhotoMap(data ?? [], weekStart));
    })();
  }, [weekInfo]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("daily_photos")
        .select("date, image_url")
        .gte("date", `${monthInfo.year}-${String(monthInfo.month).padStart(2, "0")}-01`)
        .lte("date", `${monthInfo.year}-${String(monthInfo.month).padStart(2, "0")}-31`);
      setMonthPhotoMap(buildMonthPhotoMap(data ?? []));
    })();
  }, [monthInfo]);

  // 초기 스크롤 위치 설정
  useEffect(() => {
    const idx = WALLPAPER_TYPES.indexOf(wallpaperType);
    const target = idx * SLOT_PITCH;
    if (carouselRef.current) carouselRef.current.scrollLeft = target;
    setScrollX(target);
  }, []);

  // 스크롤할 때마다 scrollX만 갱신 → style 실시간 반영
  // wallpaperType은 탭 버튼으로만 변경 (스크롤로 바뀌지 않음)
  const handleScroll = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    setScrollX(el.scrollLeft);
  }, []);

  // 탭 클릭 → wallpaperType 즉시 반영 + 스크롤 이동 (scrollX는 handleScroll이 갱신)
  const handleTabChange = useCallback((type: WallpaperType) => {
    setWallpaperType(type);
    const idx = WALLPAPER_TYPES.indexOf(type);
    carouselRef.current?.scrollTo({ left: idx * SLOT_PITCH, behavior: "smooth" });
  }, []);

  const activeColorBg = COLOR_OPTIONS.find((c) => c.key === selectedColor)?.bg ?? "#508FE1";
  const labelParts = dateLabelParts(wallpaperType, monthInfo, weekInfo, currentYear);

  return (
    <div style={s.screen}>
      <div style={s.body}>

        {/* 날짜 헤더 + 세그먼트 탭 */}
        <div style={s.headerRow}>
          <div style={s.headerInner}>
            <div style={s.dateSection}>
              <button style={s.datePicker} onClick={() => setShowPicker(true)}>
                <div style={s.dateTextGroup}>
                  <span style={s.dateLabel}>{labelParts.main}</span>
                  {labelParts.sub && <span style={s.dateLabel}>{labelParts.sub}</span>}
                </div>
                <div style={s.dateArrowBtn}>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M0 0L5 6L10 0H0Z" fill="#8B95A1" />
                  </svg>
                </div>
              </button>
            </div>
            <SegmentText value={wallpaperType} onChange={handleTabChange} />
          </div>
        </div>

        {/*
          캐러셀:
          - paddingLeft/Right = 90px → 아이템이 중앙 정렬로 snap
          - 스크롤 1칸 = 207px (SLOT_PITCH)
          - 중앙에 오는 아이템 = selected (ACTIVE_W, opacity 1)
          - 측면 아이템 = inactive (scale down to INACTIVE_W, opacity 0.6)
        */}
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          className="hide-scrollbar"
          style={s.carousel}
        >
          {WALLPAPER_TYPES.map((type, idx) => {
            // 스크롤 위치 기준으로 이 아이템이 중앙에서 얼마나 떨어져 있는지 (0 = 정중앙, 1 = 한 칸 옆)
            const distance = Math.abs(idx - scrollX / SLOT_PITCH);
            const t = Math.min(distance, 1); // 0 ~ 1 클램프

            const visualScale = 1 - (1 - INACTIVE_VISUAL_SCALE) * t;
            const opacity = 1 - 0.4 * t;
            const marginTop = INACTIVE_TOP * t;
            const borderRadius = 24 - 2 * t; // 24 → 22
            // 오른쪽 아이템: top-left origin / 왼쪽 아이템: top-right origin
            const transformOrigin = idx >= scrollX / SLOT_PITCH ? "top left" : "top right";

            return (
              <div key={type} style={s.slot}>
                <div
                  style={{
                    ...s.wallpaperCard,
                    opacity,
                    transform: `scale(${visualScale})`,
                    transformOrigin,
                    marginTop,
                    borderRadius,
                  }}
                >
                  {/* WallpaperFrame은 항상 375×812로 렌더, ACTIVE_SCALE로 축소 */}
                  <div style={s.frameInner}>
                    <WallpaperFrame
                      type={type === "Week" ? "week" : "month"}
                      previewContainer
                      photoMap={type === "Week" ? weekPhotoMap : monthPhotoMap}
                      year={type === "Week" ? weekInfo.year : monthInfo.year}
                      month={type === "Week" ? weekInfo.month : monthInfo.month}
                      petName={petName}
                      bgColor={activeColorBg}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 색상 선택 */}
        <div style={s.colorRow}>
          {COLOR_OPTIONS.map(({ key, color }) => (
            <button key={key} style={s.colorDotBtn} onClick={() => setSelectedColor(key)}>
              <ColorSelectUnit color={color} selected={selectedColor === key} />
            </button>
          ))}
        </div>

      </div>

      {/* 하단 CTA */}
      <div style={s.bottomCta}>
        <div style={s.ctaGradient}>
          <img
            src={GRADIENT_TOP}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }}
          />
        </div>
        <div style={s.ctaContainer}>
          <button
            style={s.ctaButton}
            onClick={() => navigate("Downloading", { type: wallpaperType === "Week" ? "week" : "month" })}
          >
            다운받기
          </button>
        </div>
      </div>

      {/* 날짜 피커 바텀시트 */}
      {showPicker && wallpaperType === "Month" && (
        <CalendarMonthPicker
          initialYear={monthInfo.year}
          initialMonth={monthInfo.month}
          onConfirm={(y, m) => { setMonthInfo({ year: y, month: m }); setShowPicker(false); }}
          onClose={() => setShowPicker(false)}
        />
      )}
      {showPicker && wallpaperType === "Week" && (
        <CalendarWeekPicker
          initialYear={weekInfo.year}
          initialMonth={weekInfo.month}
          initialWeek={weekInfo.week}
          onConfirm={(y, m, w) => {
            const maxWeek = weeksInMonth(y, m);
            setWeekInfo({ year: y, month: m, week: Math.min(w, maxWeek) });
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  screen: {
    width: 375,
    minHeight: "100dvh",
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  body: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    overflowX: "hidden",
    WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 20,
    flexShrink: 0,
    marginTop: 31,
    marginBottom: 31,
  },
  headerInner: {
    display: "flex",
    flex: 1,
    gap: 20,
    alignItems: "center",
    minWidth: 0,
  },
  dateSection: {
    display: "flex",
    flex: 1,
    alignItems: "center",
    minWidth: 0,
  },
  datePicker: {
    display: "flex",
    alignItems: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    outline: "none",
    WebkitTapHighlightColor: "transparent",
    flexShrink: 0,
  },
  dateTextGroup: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  dateLabel: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    lineHeight: "135%",
    color: "#191F28",
    whiteSpace: "nowrap",
  },
  dateArrowBtn: {
    display: "flex",
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  carousel: {
    display: "flex",
    flexDirection: "row",
    overflowX: "scroll",
    scrollSnapType: "x mandatory" as React.CSSProperties["scrollSnapType"],
    paddingLeft: CAROUSEL_PAD,   // 90px — 첫 아이템이 정중앙에 위치
    paddingRight: CAROUSEL_PAD,  // 90px — 마지막 아이템도 정중앙까지 스크롤 가능
    gap: GAP,
    height: ACTIVE_H,
    boxSizing: "content-box" as React.CSSProperties["boxSizing"],
    WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
    flexShrink: 0,
  },
  slot: {
    flexShrink: 0,
    width: ACTIVE_W,
    height: ACTIVE_H,
    scrollSnapAlign: "center" as React.CSSProperties["scrollSnapAlign"],
  },
  wallpaperCard: {
    width: ACTIVE_W,
    height: ACTIVE_H,
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
    position: "relative",
  },
  frameInner: {
    width: 375,
    height: 812,
    transform: `scale(${ACTIVE_SCALE})`,
    transformOrigin: "top left",
    position: "absolute",
    top: 0,
    left: 0,
  },
  colorRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginTop: 31,
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#F2F4F6",
    borderRadius: 99,
    alignSelf: "center",
    flexShrink: 0,
  },
  colorDotBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    outline: "none",
    WebkitTapHighlightColor: "transparent",
  },
  bottomCta: {
    width: "100%",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
  },
  ctaGradient: {
    height: 36,
    width: "100%",
    flexShrink: 0,
  },
  ctaContainer: {
    backgroundColor: "#fff",
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
    flexShrink: 0,
  },
  ctaButton: {
    display: "block",
    width: "100%",
    minHeight: 56,
    backgroundColor: "#508FE1",
    color: "#fff",
    fontSize: 17,
    fontWeight: 590,
    border: "none",
    borderRadius: 16,
    cursor: "pointer",
    outline: "none",
    WebkitTapHighlightColor: "transparent",
  },
};
