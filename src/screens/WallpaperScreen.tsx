import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { loadFullScreenAd, showFullScreenAd } from "@apps-in-toss/web-framework";
import { useNavigation } from "../lib/navigation";
import AppNav from "../components/AppNav";
import { supabase } from "../lib/supabase";
import { getUserKey } from "../lib/auth";
import SegmentText from "../components/SegmentText";
import WallpaperFrame, { WALLPAPER_STYLES, bgLayers, overlayLayers } from "../components/WallpaperFrame";
import ColorSelectUnit from "../components/ColorSelectUnit";
import CalendarMonthPicker from "../components/CalendarMonthPicker";
import CalendarWeekPicker from "../components/CalendarWeekPicker";
import CalendarDayPicker from "../components/CalendarDayPicker";
import { bgLayersDay } from "../components/WallpaperFrame";

type WallpaperType = "Week" | "Month" | "Day";
type WallpaperColor = "Blue" | "Black" | "Gray";

const GRADIENT_TOP = "/assets/wallpaper/gradient-top.png";
// 실 배포 전 앱인토스 콘솔에서 발급받은 adGroupId 로 교체하세요
const AD_INTERSTITIAL_GROUP_ID = (import.meta.env.VITE_ADS_INTERSTITIAL_GROUP_ID as string | undefined) ?? "ait-ad-test-interstitial-id";


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

function getWeekNumOfDay(year: number, month: number, day: number): number {
  const firstDayOffset = new Date(year, month - 1, 1).getDay();
  return Math.ceil((day + firstDayOffset) / 7);
}

function dateLabelParts(
  type: WallpaperType,
  monthInfo: { year: number; month: number },
  weekInfo: { year: number; month: number; week: number },
  dayInfo: { year: number; month: number; day: number },
  currentYear: number,
): { main: string; sub?: string } {
  if (type === "Month") {
    const prefix = monthInfo.year !== currentYear ? `${monthInfo.year}년 ` : "";
    return { main: `${prefix}${monthInfo.month}월` };
  }
  if (type === "Day") {
    const prefix = dayInfo.year !== currentYear ? `${dayInfo.year}년 ` : "";
    return { main: `${prefix}${dayInfo.month}월 ${dayInfo.day}일` };
  }
  const prefix = weekInfo.year !== currentYear ? `${weekInfo.year}년 ` : "";
  return { main: `${prefix}${weekInfo.month}월`, sub: `${weekInfo.week}주차` };
}

function toThumbUrl(url: string, square = false, size = 200): string {
  try {
    const u = new URL(url);
    u.pathname = u.pathname.replace("/object/public/", "/render/image/public/");
    u.searchParams.set("width", String(size));
    u.searchParams.set("quality", square ? "80" : "60");
    if (square) {
      u.searchParams.set("height", String(size));
      u.searchParams.set("resize", "cover");
    }
    return u.toString();
  } catch {
    return url;
  }
}

function preloadImages(urls: string[]) {
  urls.forEach((src) => { const img = new Image(); img.src = src; });
}

function buildWeekPhotoMap(
  photos: { date: string; image_url: string }[],
  weekStart: Date,
  thumb = false,
): Record<string, string> {
  const DAY_KEYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const map: Record<string, string> = {};
  photos.forEach(({ date, image_url }) => {
    const d = new Date(date + "T00:00:00");
    const diff = Math.round((d.getTime() - weekStart.getTime()) / 86400000);
    if (diff >= 0 && diff < 7) map[DAY_KEYS[d.getDay()]] = thumb ? toThumbUrl(image_url) : image_url;
  });
  return map;
}

function buildMonthPhotoMap(photos: { date: string; image_url: string }[], thumb = false): Record<string, string> {
  const map: Record<string, string> = {};
  photos.forEach(({ date, image_url }) => {
    const day = parseInt(date.split("-")[2], 10);
    map[String(day)] = thumb ? toThumbUrl(image_url) : image_url;
  });
  return map;
}

export default function WallpaperScreen() {
  const { current, navigate } = useNavigation();
  const params = current.params as { initialType?: "Week" | "Month" | "Day"; initialWeek?: { year: number; month: number; week: number }; initialMonth?: { year: number; month: number }; initialDay?: { year: number; month: number; day: number } } | undefined;

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
  const [monthInfo, setMonthInfo] = useState(
    params?.initialMonth ?? { year: currentYear, month: currentMonth }
  );
  const [weekInfo, setWeekInfo] = useState(
    params?.initialWeek ?? { year: currentYear, month: currentMonth, week: currentWeekNum }
  );
  const [weekPhotoMap, setWeekPhotoMap] = useState<Record<string, string>>({});
  const [weekThumbMap, setWeekThumbMap] = useState<Record<string, string>>({});
  const [monthPhotoMap, setMonthPhotoMap] = useState<Record<string, string>>({});
  const [monthThumbMap, setMonthThumbMap] = useState<Record<string, string>>({});
  const [dayInfo, setDayInfo] = useState(
    params?.initialDay ?? { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() }
  );
  const [dayPhotoMap, setDayPhotoMap] = useState<Record<string, string>>({});
  const [daySelected, setDaySelected] = useState(!!params?.initialDay);
  const [petName, setPetName] = useState("");
  const [petId, setPetId] = useState<string | null>(null);
  const [adLoading, setAdLoading] = useState(false);

  const screenRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollXRef = useRef(0);
  const itemInnerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeIdxRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeStyleIdx, setActiveStyleIdx] = useState(0);
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

  // 프레임 PNG 이미지 프리로드
  useEffect(() => {
    const srcs = new Set<string>();
    WALLPAPER_STYLES.forEach((style) => {
      if (wallpaperType === "Day") {
        [...bgLayersDay(style, "#508FE1"), ...bgLayersDay(style, "#000000")].forEach((l) => srcs.add(l.src));
      } else {
        const isWeek = wallpaperType === "Week";
        [...bgLayers(style, isWeek, "#508FE1"), ...bgLayers(style, isWeek, "#000000"),
         ...overlayLayers(style, isWeek)].forEach((l) => srcs.add(l.src));
      }
    });
    srcs.forEach((src) => { const img = new Image(); img.src = src; });
  }, [wallpaperType]);

  useEffect(() => {
    (async () => {
      const userKey = getUserKey();
      if (!userKey) return;
      const { data } = await supabase.from("pets").select("id, name").eq("user_id", userKey).limit(1).maybeSingle();
      if (data) { setPetName(data.name); setPetId(data.id); }
    })();
  }, []);

  useEffect(() => {
    if (!petId) return;
    const weekStart = getWeekOfMonth(weekInfo.year, weekInfo.month, weekInfo.week);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    (async () => {
      const { data } = await supabase
        .from("daily_photos")
        .select("date, image_url")
        .eq("pet_id", petId)
        .gte("date", fmt(weekStart))
        .lte("date", fmt(weekEnd));
      setWeekPhotoMap(buildWeekPhotoMap(data ?? [], weekStart));
      const thumbMap = buildWeekPhotoMap(data ?? [], weekStart, true);
      setWeekThumbMap(thumbMap);
      preloadImages(Object.values(thumbMap));
    })();
  }, [weekInfo, petId]);

  useEffect(() => {
    if (!petId) return;
    (async () => {
      const { data } = await supabase
        .from("daily_photos")
        .select("date, image_url")
        .eq("pet_id", petId)
        .gte("date", `${monthInfo.year}-${String(monthInfo.month).padStart(2, "0")}-01`)
        .lte("date", `${monthInfo.year}-${String(monthInfo.month).padStart(2, "0")}-31`);
      setMonthPhotoMap(buildMonthPhotoMap(data ?? []));
      const thumbMap = buildMonthPhotoMap(data ?? [], true);
      setMonthThumbMap(thumbMap);
      preloadImages(Object.values(thumbMap));
    })();
  }, [monthInfo, petId]);

  useEffect(() => {
    if (!petId || !daySelected) return;
    const pad = (n: number) => String(n).padStart(2, "0");
    const dateStr = `${dayInfo.year}-${pad(dayInfo.month)}-${pad(dayInfo.day)}`;
    (async () => {
      const { data } = await supabase
        .from("daily_photos")
        .select("image_url")
        .eq("pet_id", petId)
        .eq("date", dateStr)
        .maybeSingle();
      setDayPhotoMap(data ? { photo: toThumbUrl(data.image_url, true, 600) } : {});
    })();
  }, [dayInfo, petId, daySelected]);

  const dimsRef = useRef(dims);
  dimsRef.current = dims;

  const applyCarouselStyles = useCallback((sx: number) => {
    const d = dimsRef.current;
    WALLPAPER_STYLES.forEach((_, idx) => {
      const el = itemInnerRefs.current[idx];
      if (!el) return;
      const distance = Math.abs(idx - sx / d.slotPitch);
      const t = Math.min(distance, 1);
      el.style.opacity = String(1 - 0.4 * t);
      el.style.transform = `scale(${1 - (1 - d.inactiveVisualScale) * t})`;
      el.style.transformOrigin = idx >= sx / d.slotPitch ? "top left" : "top right";
      el.style.marginTop = `${d.inactiveTop * t}px`;
      el.style.borderRadius = `${24 - 2 * t}px`;
    });
  }, []);

  useEffect(() => {
    applyCarouselStyles(scrollXRef.current);
  }, [applyCarouselStyles, dims]);

  const handleScroll = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    scrollXRef.current = el.scrollLeft;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      applyCarouselStyles(scrollXRef.current);
      rafRef.current = null;
    });
    if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
    scrollEndTimerRef.current = setTimeout(() => {
      const d = dimsRef.current;
      const newIdx = Math.min(Math.max(Math.round(scrollXRef.current / d.slotPitch), 0), WALLPAPER_STYLES.length - 1);
      if (newIdx !== activeIdxRef.current) {
        activeIdxRef.current = newIdx;
        setActiveStyleIdx(newIdx);
      }
    }, 200);
  }, [applyCarouselStyles]);

  const handleTabChange = useCallback((type: WallpaperType) => {
    if (type === "Week") {
      if (wallpaperType === "Day" && daySelected) {
        setWeekInfo({ year: dayInfo.year, month: dayInfo.month, week: getWeekNumOfDay(dayInfo.year, dayInfo.month, dayInfo.day) });
      } else {
        setWeekInfo({ year: monthInfo.year, month: monthInfo.month, week: 1 });
      }
    } else if (type === "Month") {
      if (wallpaperType === "Day" && daySelected) {
        setMonthInfo({ year: dayInfo.year, month: dayInfo.month });
      } else {
        setMonthInfo({ year: weekInfo.year, month: weekInfo.month });
      }
    } else if (type === "Day") {
      setDaySelected(false);
    }
    setWallpaperType(type);
  }, [wallpaperType, daySelected, dayInfo, monthInfo, weekInfo]);


  const activeColorBg = COLOR_OPTIONS.find((c) => c.key === selectedColor)?.bg ?? "#508FE1";
  const labelParts = dateLabelParts(wallpaperType, monthInfo, weekInfo, dayInfo, currentYear);
  const selectedStyle = WALLPAPER_STYLES[activeStyleIdx];

  // 주별: 7장 모두 있어야 활성화
  // 월별: 해당 월 전체 날짜 수만큼 사진 있어야 활성화
  const isCtaEnabled = wallpaperType === "Week"
    ? Object.keys(weekPhotoMap).length === 7
    : wallpaperType === "Month"
    ? Object.keys(monthPhotoMap).length === new Date(monthInfo.year, monthInfo.month, 0).getDate()
    : daySelected && Object.keys(dayPhotoMap).length > 0;

  const getDownloadParams = useCallback(() => {
    if (wallpaperType === "Day") {
      const pad = (n: number) => String(n).padStart(2, "0");
      const dateStr = `${dayInfo.year}-${pad(dayInfo.month)}-${pad(dayInfo.day)}`;
      const fullPhotoMap: Record<string, string> = {};
      if (petId) {
        // fetch at download time will happen in DownloadingScreen via photoMap
      }
      return {
        frameStyle: selectedStyle,
        bgColor: activeColorBg,
        wallpaperType: "day" as const,
        year: dayInfo.year,
        month: dayInfo.month,
        day: dayInfo.day,
        photoMap: dayPhotoMap,
        petName,
        _dateStr: dateStr,
      };
    }
    return {
      frameStyle: selectedStyle,
      bgColor: activeColorBg,
      wallpaperType: wallpaperType === "Week" ? "week" as const : "month" as const,
      year: wallpaperType === "Week" ? weekInfo.year : monthInfo.year,
      month: wallpaperType === "Week" ? weekInfo.month : monthInfo.month,
      week: wallpaperType === "Week" ? weekInfo.week : undefined,
      photoMap: wallpaperType === "Week" ? weekPhotoMap : monthPhotoMap,
      petName,
    };
  }, [selectedStyle, activeColorBg, wallpaperType, weekInfo, monthInfo, dayInfo, weekPhotoMap, monthPhotoMap, dayPhotoMap, petName, petId]);

  const handleCtaClick = useCallback(() => {
    if (!isCtaEnabled || adLoading) return;

    const params = getDownloadParams();
    const goToDownload = () => {
      setAdLoading(false);
      navigate("Downloading", params);
    };

    if (!loadFullScreenAd.isSupported()) {
      goToDownload();
      return;
    }

    setAdLoading(true);
    loadFullScreenAd({
      options: { adGroupId: AD_INTERSTITIAL_GROUP_ID },
      onEvent: (event) => {
        if (event.type === "loaded") {
          showFullScreenAd({
            options: { adGroupId: AD_INTERSTITIAL_GROUP_ID },
            onEvent: (showEvent) => {
              if (showEvent.type === "dismissed" || showEvent.type === "failedToShow") {
                goToDownload();
              }
            },
            onError: goToDownload,
          });
        }
      },
      onError: goToDownload,
    });
  }, [isCtaEnabled, adLoading, navigate, getDownloadParams]);

  return (
    <div ref={screenRef} style={s.screen}>
      <AppNav showTitle onBack={() => navigate("HomeMonth")} />
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

        {/* 캐러셀 + 색상 선택: headerRow와 bottomCta 사이 수직 중앙 */}
        <div style={s.centerContent}>
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
              const initT = Math.min(idx, 1);
              const initScale = 1 - (1 - dims.inactiveVisualScale) * initT;

              return (
                <div key={style} style={{ ...s.slot, width: dims.activeW, height: dims.activeH }}>
                  <div
                    ref={(el) => { itemInnerRefs.current[idx] = el; }}
                    style={{
                      width: dims.activeW,
                      height: dims.activeH,
                      overflow: "hidden",
                      position: "relative",
                      opacity: 1 - 0.4 * initT,
                      transform: `scale(${initScale})`,
                      transformOrigin: "top left",
                      marginTop: dims.inactiveTop * initT,
                      borderRadius: 24 - 2 * initT,
                      willChange: "transform, opacity",
                    }}
                  >
                    <div style={{ width: 375, height: 812, transform: `scale(${dims.activeScale})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
                      <WallpaperFrame
                        type={wallpaperType === "Week" ? "week" : wallpaperType === "Day" ? "day" : "month"}
                        frameStyle={style}
                        previewContainer={true}
                        photoMap={wallpaperType === "Week" ? weekPhotoMap : wallpaperType === "Day" ? dayPhotoMap : monthPhotoMap}
                        year={wallpaperType === "Week" ? weekInfo.year : wallpaperType === "Day" ? dayInfo.year : monthInfo.year}
                        month={wallpaperType === "Week" ? weekInfo.month : wallpaperType === "Day" ? dayInfo.month : monthInfo.month}
                        week={wallpaperType === "Week" ? weekInfo.week : undefined}
                        day={wallpaperType === "Day" ? dayInfo.day : undefined}
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
          {!isCtaEnabled && (
            <p style={s.ctaHelperText}>
              {wallpaperType === "Week"
                ? "7일을 모두 업로드해야 다운로드할 수 있어요."
                : wallpaperType === "Day"
                ? (daySelected ? "오늘의 이미지 업로드가 필요해요." : "날짜를 선택하면 다운로드할 수 있어요.")
                : "한달을 모두 업로드해야 다운로드할 수 있어요."}
            </p>
          )}
          <button
            disabled={!isCtaEnabled || adLoading}
            style={{
              ...s.ctaButton,
              backgroundColor: (isCtaEnabled && !adLoading) ? "#508FE1" : "#D1D6DB",
              cursor: (isCtaEnabled && !adLoading) ? "pointer" : "default",
            }}
            onClick={handleCtaClick}
          >
            {adLoading ? "광고 불러오는 중..." : "다운받기"}
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
      {showPicker && wallpaperType === "Day" && (
        <CalendarDayPicker
          initialYear={dayInfo.year}
          initialMonth={dayInfo.month}
          initialDay={dayInfo.day}
          onConfirm={(y, m, d) => {
            setDayInfo({ year: y, month: m, day: d });
            setDaySelected(true);
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
  centerContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 0,
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
  ctaHelperText: {
    margin: 0,
    marginBottom: 20,
    paddingLeft: 4,
    paddingRight: 4,
    fontSize: 15,
    fontWeight: 510,
    color: "rgba(0, 19, 43, 0.58)",
    lineHeight: 1.5,
    textAlign: "center" as const,
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
