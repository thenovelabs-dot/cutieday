import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigation } from "../lib/navigation";
import { supabase } from "../lib/supabase";
import SegmentText from "../components/SegmentText";
import WallpaperFrame, { WALLPAPER_STYLES } from "../components/WallpaperFrame";
import ColorSelectUnit from "../components/ColorSelectUnit";
import CalendarMonthPicker from "../components/CalendarMonthPicker";
import CalendarWeekPicker from "../components/CalendarWeekPicker";

type WallpaperType = "Week" | "Month";
type WallpaperColor = "Blue" | "Black" | "Gray";

const GRADIENT_TOP = "/assets/wallpaper/gradient-top.png";

// ── 테스트용 더미 이미지 (TODO: 배포 전 제거) ──────────────────
const _COLORS = ["#e63946","#457b9d","#2a9d8f","#e9c46a","#f4a261","#264653","#a8dadc","#6a4c93","#ff6b6b","#4ecdc4"];
const _mkImg = (c: string) => `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='${encodeURIComponent(c)}'/%3E%3C/svg%3E`;
const TEST_WEEK: Record<string, string> = Object.fromEntries(
  ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((k, i) => [k, _mkImg(_COLORS[i])])
);
const TEST_MONTH: Record<string, string> = Object.fromEntries(
  Array.from({ length: 31 }, (_, i) => [String(i + 1), _mkImg(_COLORS[i % _COLORS.length])])
);

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

  const screenRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollX, setScrollX] = useState(0);
  const [containerWidth, setContainerWidth] = useState(375);

  useEffect(() => {
    const el = screenRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.offsetWidth || 375);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 컨테이너 너비 기준 캐러셀 치수 계산
  const dims = useMemo(() => {
    const activeW = Math.round(containerWidth * (195 / 375));
    const activeH = Math.round(containerWidth * (422 / 375));
    const inactiveW = Math.round(containerWidth * (176 / 375));
    const inactiveTop = containerWidth * (20 / 375);
    const gap = containerWidth * (12 / 375);
    const carouselPad = (containerWidth - activeW) / 2;
    const slotPitch = activeW + gap;
    const activeScale = activeW / 375;
    const inactiveVisualScale = inactiveW / activeW;
    return { activeW, activeH, inactiveW, inactiveTop, gap, carouselPad, slotPitch, activeScale, inactiveVisualScale };
  }, [containerWidth]);

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

  const handleScroll = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    setScrollX(el.scrollLeft);
  }, []);

  const handleTabChange = useCallback((type: WallpaperType) => {
    setWallpaperType(type);
  }, []);

  const activeColorBg = COLOR_OPTIONS.find((c) => c.key === selectedColor)?.bg ?? "#508FE1";
  const labelParts = dateLabelParts(wallpaperType, monthInfo, weekInfo, currentYear);
  const activeStyleIdx = Math.min(Math.max(Math.round(scrollX / dims.slotPitch), 0), WALLPAPER_STYLES.length - 1);
  const selectedStyle = WALLPAPER_STYLES[activeStyleIdx];

  return (
    <div ref={screenRef} style={s.screen}>
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
          style={{
            ...s.carousel,
            paddingLeft: dims.carouselPad,
            paddingRight: dims.carouselPad,
            gap: dims.gap,
            height: dims.activeH,
          }}
        >
          {WALLPAPER_STYLES.map((style, idx) => {
            const distance = Math.abs(idx - scrollX / dims.slotPitch);
            const t = Math.min(distance, 1);

            const visualScale = 1 - (1 - dims.inactiveVisualScale) * t;
            const opacity = 1 - 0.4 * t;
            const marginTop = dims.inactiveTop * t;
            const borderRadius = 24 - 2 * t;
            const transformOrigin = idx >= scrollX / dims.slotPitch ? "top left" : "top right";

            return (
              <div key={style} style={{ ...s.slot, width: dims.activeW, height: dims.activeH }}>
                <div
                  style={{
                    width: dims.activeW,
                    height: dims.activeH,
                    overflow: "hidden",
                    position: "relative",
                    opacity,
                    transform: `scale(${visualScale})`,
                    transformOrigin,
                    marginTop,
                    borderRadius,
                  }}
                >
                  <div style={{ width: 375, height: 812, transform: `scale(${dims.activeScale})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
                    <WallpaperFrame
                      type={wallpaperType === "Week" ? "week" : "month"}
                      frameStyle={style}
                      previewContainer
                      photoMap={wallpaperType === "Week"
                        ? (Object.keys(weekPhotoMap).length ? weekPhotoMap : TEST_WEEK)
                        : (Object.keys(monthPhotoMap).length ? monthPhotoMap : TEST_MONTH)
                      }
                      year={wallpaperType === "Week" ? weekInfo.year : monthInfo.year}
                      month={wallpaperType === "Week" ? weekInfo.month : monthInfo.month}
                      week={wallpaperType === "Week" ? weekInfo.week : undefined}
                      petName={petName || "몽치"}
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
            onClick={() => navigate("Downloading", { type: wallpaperType === "Week" ? "week" : "month", style: selectedStyle })}
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
    width: "100%",
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
    boxSizing: "content-box" as React.CSSProperties["boxSizing"],
    WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
    flexShrink: 0,
  },
  slot: {
    flexShrink: 0,
    scrollSnapAlign: "center" as React.CSSProperties["scrollSnapAlign"],
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
