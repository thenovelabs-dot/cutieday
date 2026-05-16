import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigation } from "../lib/navigation";
import { supabase } from "../lib/supabase";
import SegmentText from "../components/SegmentText";
import WallpaperFrame from "../components/WallpaperFrame";
import CalendarMonthPicker from "../components/CalendarMonthPicker";
import CalendarWeekPicker from "../components/CalendarWeekPicker";

const ARROW_DOWN = "/assets/wallpaper/arrow-down.svg";
const COLOR_BLUE_SVG = "/assets/wallpaper/color-blue-selected.svg";
const GRADIENT_TOP = "/assets/wallpaper/gradient-top.png";

type WallpaperType = "Week" | "Month";
type WallpaperColor = "Blue" | "Black" | "Gray";

const PHONE_SCALE = 194 / 375;
const PHONE_W = Math.round(375 * PHONE_SCALE); // 194
const PHONE_H = Math.round(812 * PHONE_SCALE); // 420
const CAROUSEL_ITEM_W = PHONE_W + 24; // phone + horizontal margin

const COLOR_OPTIONS: { key: WallpaperColor; bg: string }[] = [
  { key: "Blue",  bg: "#5e96df" },
  { key: "Black", bg: "#000000" },
  { key: "Gray",  bg: "#232323" },
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

// 날짜 헤더 레이블
function dateLabel(
  type: WallpaperType,
  monthInfo: { year: number; month: number },
  weekInfo: { year: number; month: number; week: number },
  currentYear: number,
): string {
  if (type === "Month") {
    const prefix = monthInfo.year !== currentYear ? `${monthInfo.year}년 ` : "";
    return `${prefix}${monthInfo.month}월`;
  }
  const prefix = weekInfo.year !== currentYear ? `${weekInfo.year}년 ` : "";
  return `${prefix}${weekInfo.month}월 ${weekInfo.week}주차`;
}

// 주별 날짜키 → 이미지 매핑: "Mon"~"Sun" 키
function buildWeekPhotoMap(
  photos: { date: string; image_url: string }[],
  weekStart: Date,
): Record<string, string> {
  const DAY_KEYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const map: Record<string, string> = {};
  photos.forEach(({ date, image_url }) => {
    const d = new Date(date + "T00:00:00");
    const diff = Math.round((d.getTime() - weekStart.getTime()) / 86400000);
    if (diff >= 0 && diff < 7) {
      map[DAY_KEYS[d.getDay()]] = image_url;
    }
  });
  return map;
}

// 월별 날짜키 → 이미지 매핑: "1"~"31" 키
function buildMonthPhotoMap(
  photos: { date: string; image_url: string }[],
): Record<string, string> {
  const map: Record<string, string> = {};
  photos.forEach(({ date, image_url }) => {
    const day = parseInt(date.split("-")[2], 10);
    map[String(day)] = image_url;
  });
  return map;
}

// 뒤로가기 아이콘
function ChevronLeft() {
  return (
    <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
      <path d="M8 1L1 8L8 15" stroke="#191F28" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function WallpaperScreen() {
  const { current, goBack, navigate } = useNavigation();
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

  const [photoMap, setPhotoMap] = useState<Record<string, string>>({});
  const [petName, setPetName] = useState("");

  const carouselRef = useRef<HTMLDivElement>(null);
  const isScrollingByCode = useRef(false);

  // 펫 이름 로드
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("pets")
        .select("name")
        .limit(1)
        .single();
      if (data) setPetName(data.name);
    })();
  }, []);

  // 사진 로드
  useEffect(() => {
    (async () => {
      if (wallpaperType === "Week") {
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
        setPhotoMap(buildWeekPhotoMap(data ?? [], weekStart));
      } else {
        const { data } = await supabase
          .from("daily_photos")
          .select("date, image_url")
          .gte("date", `${monthInfo.year}-${String(monthInfo.month).padStart(2, "0")}-01`)
          .lte("date", `${monthInfo.year}-${String(monthInfo.month).padStart(2, "0")}-31`);
        setPhotoMap(buildMonthPhotoMap(data ?? []));
      }
    })();
  }, [wallpaperType, weekInfo, monthInfo]);

  // 캐러셀 스크롤 → 색상 동기화
  const handleCarouselScroll = useCallback(() => {
    if (isScrollingByCode.current) return;
    const el = carouselRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / CAROUSEL_ITEM_W);
    const clamped = Math.max(0, Math.min(idx, COLOR_OPTIONS.length - 1));
    setSelectedColor(COLOR_OPTIONS[clamped].key);
  }, []);

  // 색상 클릭 → 캐러셀 스크롤
  const scrollToColor = (colorKey: WallpaperColor) => {
    const idx = COLOR_OPTIONS.findIndex((c) => c.key === colorKey);
    if (idx === -1 || !carouselRef.current) return;
    isScrollingByCode.current = true;
    carouselRef.current.scrollTo({ left: idx * CAROUSEL_ITEM_W, behavior: "smooth" });
    setSelectedColor(colorKey);
    setTimeout(() => { isScrollingByCode.current = false; }, 400);
  };

  // 초기 캐러셀 위치 (Blue = 첫 번째)
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = 0;
    }
  }, []);

  const label = dateLabel(wallpaperType, monthInfo, weekInfo, currentYear);

  const activeColorBg = COLOR_OPTIONS.find((c) => c.key === selectedColor)?.bg ?? "#5e96df";

  return (
    <div style={s.screen}>
      {/* 네비게이션 바 */}
      <div style={s.navBar}>
        <button style={s.navBtn} onClick={goBack}>
          <ChevronLeft />
        </button>
        <div style={s.navTitle}>
          <span style={s.navTitleText}>오늘도 귀여웠어</span>
        </div>
        <button style={s.navBtn} onClick={goBack}>
          <span style={{ fontSize: 17, color: "#191F28" }}>✕</span>
        </button>
      </div>

      {/* 스크롤 가능한 본문 */}
      <div style={s.body}>

        {/* 날짜 헤더 + 세그먼트 */}
        <div style={s.headerRow}>
          <button style={s.datePicker} onClick={() => setShowPicker(true)}>
            <span style={s.dateLabel}>{label}</span>
            <img src={ARROW_DOWN} alt="" style={{ width: 16, height: 16, flexShrink: 0 }} />
          </button>
          <SegmentText
            value={wallpaperType === "Week" ? "Week" : "Month"}
            onChange={(v) => setWallpaperType(v === "Week" ? "Week" : "Month")}
          />
        </div>

        {/* 배경화면 캐러셀 */}
        <div
          ref={carouselRef}
          style={s.carousel}
          onScroll={handleCarouselScroll}
          className="hide-scrollbar"
        >
          {COLOR_OPTIONS.map(({ key, bg }) => (
            <div key={key} style={{ ...s.carouselItem, scrollSnapAlign: "start" }}>
              {/* 폰 목업 */}
              <div style={s.phoneMockup}>
                <div style={{
                  width: 375,
                  height: 812,
                  transform: `scale(${PHONE_SCALE})`,
                  transformOrigin: "top left",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}>
                  <WallpaperFrame
                    type={wallpaperType === "Week" ? "week" : "month"}
                    previewContainer
                    photoMap={photoMap}
                    year={wallpaperType === "Week" ? weekInfo.year : monthInfo.year}
                    month={wallpaperType === "Week" ? weekInfo.month : monthInfo.month}
                    petName={petName}
                    bgColor={bg}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 색상 선택 */}
        <div style={s.colorRow}>
          {COLOR_OPTIONS.map(({ key, bg }) => {
            const isSelected = selectedColor === key;
            return (
              <button
                key={key}
                style={{ ...s.colorDotWrap, ...(isSelected ? s.colorDotWrapSelected : {}) }}
                onClick={() => scrollToColor(key)}
              >
                {key === "Blue" ? (
                  <img src={COLOR_BLUE_SVG} alt="Blue" style={{ width: 44, height: 44, borderRadius: "50%" }} />
                ) : (
                  <div style={{ ...s.colorDot, backgroundColor: bg }} />
                )}
              </button>
            );
          })}
        </div>

      </div>

      {/* 하단 CTA */}
      <div style={s.bottomCta}>
        <img
          src={GRADIENT_TOP}
          alt=""
          style={{ position: "absolute", top: 0, left: 0, right: 0, height: 36, width: "100%", objectFit: "cover", pointerEvents: "none" }}
        />
        <div style={s.ctaContainer}>
          <button
            style={s.ctaButton}
            onClick={() => navigate("Downloading", { type: wallpaperType === "Week" ? "week" : "month" })}
          >
            광고보고 다운받기
          </button>
        </div>
      </div>

      {/* 날짜 피커 */}
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
    height: 812,
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
  },
  navBar: {
    height: 44,
    display: "flex",
    alignItems: "center",
    paddingLeft: 8,
    paddingRight: 8,
    flexShrink: 0,
    borderBottom: "0.5px solid #E5E8EB",
  },
  navBtn: {
    width: 44,
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    flexShrink: 0,
  },
  navTitle: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  navTitleText: {
    fontSize: 17,
    fontWeight: 600,
    color: "#191F28",
    lineHeight: 1.35,
  },
  body: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  headerRow: {
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 24,
    paddingRight: 24,
    flexShrink: 0,
    marginTop: 31,
    marginBottom: 31,
  },
  datePicker: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  dateLabel: {
    fontSize: 22,
    fontWeight: 700,
    color: "#191F28",
    lineHeight: 1.35,
  },
  carousel: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
    flexShrink: 0,
    gap: 24,
    paddingLeft: (375 - PHONE_W) / 2,
    paddingRight: (375 - PHONE_W) / 2,
    boxSizing: "border-box",
  },
  carouselItem: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  phoneMockup: {
    width: PHONE_W,
    height: PHONE_H,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
  },
  colorRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 30,
    marginTop: 31,
    padding: 12,
    backgroundColor: "#F2F4F6",
    borderRadius: 99,
    alignSelf: "center",
    flexShrink: 0,
  },
  colorDotWrap: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  colorDotWrapSelected: {
    outline: "2.5px solid #508FE1",
    outlineOffset: 3,
  },
  colorDot: {
    width: 44,
    height: 44,
    borderRadius: "50%",
  },
  bottomCta: {
    position: "relative",
    width: "100%",
    flexShrink: 0,
  },
  ctaContainer: {
    backgroundColor: "#fff",
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
  },
  ctaButton: {
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
  },
};
