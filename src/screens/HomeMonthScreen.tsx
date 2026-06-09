import React, { useState, useEffect, useRef } from "react";
import { useNavigation } from "../lib/navigation";
import { supabase } from "../lib/supabase";
import { getUserKey } from "../lib/auth";
import Calendar from "../components/Calendar";
import SegmentText from "../components/SegmentText";
import HomeUploadCard from "../components/HomeUploadCard";
import AnimalProfile from "../components/AnimalProfile";
import CalendarMonthPicker from "../components/CalendarMonthPicker";
import CalendarWeekPicker from "../components/CalendarWeekPicker";
import AppNav from "../components/AppNav";
import HomeBannerAd from "../components/HomeBannerAd";
import SuccessPopup from "../components/SuccessPopup";

interface Pet {
  id: string;
  name: string;
  species: string;
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getWeekStartDate(y: number, m: number, w: number): Date {
  const firstDay = new Date(y, m - 1, 1).getDay();
  return new Date(y, m - 1, 1 - firstDay + (w - 1) * 7);
}

const ArrowRight = () => (
  <div style={s.arrowContainer}>
    <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
      <path d="M1 1L6 6L1 11" stroke="#B0B8C1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

export default function HomeMonthScreen() {
  const { navigate } = useNavigation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingDateRef = useRef<string>("");

  const today = new Date();
  const todayStr = formatDate(today);

  const [viewDate, setViewDate] = useState(() => {
    const uploaded = sessionStorage.getItem("pendingUploadDate");
    if (uploaded) {
      const [y, m] = uploaded.split("-").map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [calendarType, setCalendarType] = useState<"Month" | "Week">("Month");
  const [pet, setPet] = useState<Pet | null>(null);
  const [photoMap, setPhotoMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(
    () => sessionStorage.getItem("pendingUploadDate")
  );
  const [weekInfo, setWeekInfo] = useState<{ year: number; month: number; week: number } | null>(null);
  const [showToast, setShowToast] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPopupRef = useRef(sessionStorage.getItem("pendingSuccessPopup") as "week" | "month" | null);
  const [successPopupType, setSuccessPopupType] = useState<"week" | "month" | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("pendingUploadToast");
    if (!raw) return;
    sessionStorage.removeItem("pendingUploadToast");
    sessionStorage.removeItem("pendingUploadDate");
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setShowToast(true);
    toastTimerRef.current = setTimeout(() => setShowToast(false), 2000);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth() + 1;

  // 업로드 카드 기준 날짜: 날짜 클릭 시 해당 날짜 / 기본값은 현재달=오늘, 다른달=1일
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const defaultDateStr = isCurrentMonth ? todayStr : `${year}-${String(month).padStart(2, "0")}-01`;

  // 주별 뷰 기본 선택: 오늘이 해당 주에 포함되면 오늘, 아니면 주 첫째날(일요일)
  const effectiveWeekStart = weekInfo
    ? getWeekStartDate(weekInfo.year, weekInfo.month, weekInfo.week)
    : (() => { const d = new Date(today); d.setDate(d.getDate() - d.getDay()); return d; })();
  const weekStartStr = formatDate(effectiveWeekStart);
  const weekEndStr = formatDate(new Date(effectiveWeekStart.getFullYear(), effectiveWeekStart.getMonth(), effectiveWeekStart.getDate() + 6));
  const todayInWeek = todayStr >= weekStartStr && todayStr <= weekEndStr;
  const weekDefaultDateStr = todayInWeek ? todayStr : weekStartStr;

  const activeDateStr = calendarType === "Week"
    ? (selectedDateStr ?? weekDefaultDateStr)
    : (selectedDateStr ?? defaultDateStr);
  const isFuture = activeDateStr > todayStr;

  const [, activeMStr, activeDStr] = activeDateStr.split("-");
  const cardMonth = Number(activeMStr);
  const cardDayNum = activeDStr;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const userKey = getUserKey();
      if (!userKey) { setLoading(false); return; }

      const { data: resolvedPet } = await supabase
        .from("pets").select("id, name, species").eq("user_id", userKey).limit(1).maybeSingle();
      if (cancelled || !resolvedPet) { setLoading(false); return; }
      setPet(resolvedPet);

      let photoData: { date: string; image_url: string }[] | null = null;
      if (calendarType === "Week") {
        // 주가 월을 넘어갈 수 있으므로 실제 주 날짜 범위로 조회
        const { data } = await supabase
          .from("daily_photos").select("date, image_url")
          .eq("pet_id", resolvedPet.id)
          .gte("date", weekStartStr)
          .lte("date", weekEndStr);
        photoData = data;
      } else {
        const mm = String(month).padStart(2, "0");
        const { data } = await supabase
          .from("daily_photos").select("date, image_url")
          .eq("pet_id", resolvedPet.id)
          .gte("date", `${year}-${mm}-01`)
          .lte("date", `${year}-${mm}-${String(getDaysInMonth(year, month)).padStart(2, "0")}`);
        photoData = data;
      }

      if (!cancelled) {
        const map = new Map<string, string>();
        photoData?.forEach((p) => map.set(p.date, p.image_url));
        setPhotoMap(map);
        setLoading(false);
        if (pendingPopupRef.current) {
          sessionStorage.removeItem("pendingSuccessPopup");
          setSuccessPopupType(pendingPopupRef.current);
          pendingPopupRef.current = null;
        }
      }
    })();
    return () => { cancelled = true; };
  }, [year, month, calendarType, weekStartStr, weekEndStr]);


  const firstDayOffset = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const weekOfMonth = Math.ceil((today.getDate() + firstDayOffset) / 7);

  const weekYear = weekInfo?.year ?? today.getFullYear();
  const weekMonth = weekInfo?.month ?? (today.getMonth() + 1);
  const weekNum = weekInfo?.week ?? weekOfMonth;
  const weekStartDate = weekInfo ? effectiveWeekStart : undefined;

  const handleCalendarTypeChange = (type: "Month" | "Week") => {
    setCalendarType(type);
    if (type === "Week") {
      if (selectedDateStr) {
        // 선택된 날짜가 속한 주로 이동
        const [y, m, d] = selectedDateStr.split("-").map(Number);
        const sunday = new Date(y, m - 1, d);
        sunday.setDate(sunday.getDate() - sunday.getDay());
        const sunY = sunday.getFullYear();
        const sunM = sunday.getMonth() + 1;
        const firstDayOff = new Date(sunY, sunM - 1, 1).getDay();
        const week = Math.ceil((sunday.getDate() + firstDayOff) / 7);
        setWeekInfo({ year: sunY, month: sunM, week });
        setViewDate(new Date(sunY, sunM - 1, 1));
      } else {
        // 선택 날짜 없으면 현재 보고 있는 달의 1주차로 이동
        setWeekInfo({ year, month, week: 1 });
      }
    } else {
      // 선택된 날짜의 달로 이동, 없으면 마지막 주가 속한 달
      if (selectedDateStr) {
        const [y, m] = selectedDateStr.split("-").map(Number);
        setViewDate(new Date(y, m - 1, 1));
      } else {
        setViewDate(new Date(weekYear, weekMonth - 1, 1));
      }
    }
  };

  return (
    <>
    <style>{`@keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>
    <div style={s.container}>
      <AppNav showTitle showBell />
      <div style={s.scroll}>

        {/* 반려동물 프로필 카드 — node 92:4794 */}
        <button style={s.petCard} onClick={() => navigate("PetEdit")}>
          <AnimalProfile type={pet?.species === "고양이" ? "Cat" : "Puppy"} />
          <div style={s.petListRow}>
            <div style={s.petInfo}>
              <p style={s.petSubLabel}>오늘도 귀여운</p>
              <p style={s.petName}>{pet?.name ?? "반려동물"} ❤️</p>
            </div>
            <ArrowRight />
          </div>
        </button>

        {/* 달력 블록 — node 92:4797 */}
        <div style={s.calendarBlock}>

          {/* 월 헤더 + 달력 — node 92:4798 */}
          <div style={s.calendarSection}>
            <div style={s.calendarHeaderRow}>
              <button style={s.monthGroup} onClick={() => setShowPicker(true)}>
                <p style={s.monthLabel}>
                  {calendarType === "Week"
                    ? `${weekYear !== today.getFullYear() ? `${weekYear}년 ` : ""}${weekMonth}월 ${weekNum}주차`
                    : `${year !== today.getFullYear() ? `${year}년 ` : ""}${month}월`}
                </p>
                <div style={s.monthArrowBtn}>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M0 0L5 6L10 0H0Z" fill="#8B95A1" />
                  </svg>
                </div>
              </button>
              <SegmentText value={calendarType} onChange={handleCalendarTypeChange} />
            </div>

            {loading ? (
              <div style={s.skeleton} />
            ) : calendarType === "Week" ? (
              <div style={{ marginLeft: -20, marginRight: -20 }}>
                <Calendar type={calendarType} year={year} month={month} today={today} photoMap={photoMap} weekStartDate={weekStartDate} onDayPress={setSelectedDateStr} selectedDateStr={activeDateStr} />
              </div>
            ) : (
              <Calendar type={calendarType} year={year} month={month} today={today} photoMap={photoMap} onDayPress={setSelectedDateStr} selectedDateStr={activeDateStr} />
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              e.target.value = "";
              navigate("ImageAdjust", { uri: URL.createObjectURL(file), date: pendingDateRef.current });
            }}
          />

          <div style={{ margin: "0 -20px" }}>
            <HomeBannerAd />
          </div>

          {/* 날짜 + 업로드 카드 — 날짜 클릭 or 기본(현재달=오늘/다른달=1일), 미래는 업로드 불가 */}
          <div style={s.uploadSection}>
            <p style={s.dateLabel}>{cardMonth}월{cardDayNum}일</p>
            <HomeUploadCard
              type={isFuture ? "Future" : (photoMap.get(activeDateStr) ? "Upload" : "None")}
              petName={pet?.name ?? "반려동물"}
              imageUrl={photoMap.get(activeDateStr)}
              onUpload={() => { pendingDateRef.current = activeDateStr; fileInputRef.current?.click(); }}
              onChangePhoto={() => { pendingDateRef.current = activeDateStr; fileInputRef.current?.click(); }}
            />
          </div>
        </div>

        {/* 배경화면 만들기 배너 — node 92:4877 */}
        <button style={s.wallpaperBanner} onClick={() => {
          if (calendarType === "Week") {
            navigate("Wallpaper", {
              initialType: "Week",
              initialWeek: { year: weekYear, month: weekMonth, week: weekNum },
            });
          } else {
            navigate("Wallpaper", {
              initialType: "Month",
              initialMonth: { year, month },
            });
          }
        }}>
          <div style={s.wallpaperListRow}>
            <div style={s.wallpaperText}>
              <p style={s.wallpaperTitle}>{pet?.name ?? "반려동물"} 배경화면 만들기</p>
              <p style={s.wallpaperSubtitle}>업로드한 사진으로 배경화면을 만들어보세요.</p>
            </div>
            <ArrowRight />
          </div>
        </button>

      </div>
    </div>

    {showPicker && calendarType === "Month" && (
      <CalendarMonthPicker
        initialYear={year}
        initialMonth={month}
        onClose={() => setShowPicker(false)}
        onConfirm={(y, m) => {
          setViewDate(new Date(y, m - 1, 1));
          setSelectedDateStr(null);
          setWeekInfo(null);
          setShowPicker(false);
        }}
      />
    )}
    {showPicker && calendarType === "Week" && (
      <CalendarWeekPicker
        initialYear={weekYear}
        initialMonth={weekMonth}
        initialWeek={weekNum}
        onClose={() => setShowPicker(false)}
        onConfirm={(y, m, w) => {
          setWeekInfo({ year: y, month: m, week: w });
          setViewDate(new Date(y, m - 1, 1));
          setSelectedDateStr(null);
          setShowPicker(false);
        }}
      />
    )}
    {successPopupType && (
      <SuccessPopup
        type={successPopupType}
        animalType={pet?.species === "고양이" ? "Cat" : "Puppy"}
        onClose={() => setSuccessPopupType(null)}
        onGoWallpaper={() => {
          setSuccessPopupType(null);
          const isMonth = successPopupType === "month";
          const base = selectedDateStr ?? activeDateStr;
          const [dy, dm, dd] = base.split("-").map(Number);
          const firstDayOffset = new Date(dy, dm - 1, 1).getDay();
          const weekNum = Math.ceil((dd + firstDayOffset) / 7);
          navigate("Wallpaper", {
            initialType: isMonth ? "Month" : "Week",
            initialWeek: isMonth ? undefined : { year: dy, month: dm, week: weekNum },
            initialMonth: isMonth ? { year: dy, month: dm } : undefined,
          });
        }}
      />
    )}
    {showToast && (
      <div style={{
        position: "fixed",
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "white",
        backdropFilter: "blur(15px)",
        WebkitBackdropFilter: "blur(15px)",
        boxShadow: "0px 2px 15px rgba(0, 27, 55, 0.1)",
        padding: "12px 16px 12px 12px",
        borderRadius: 9999,
        whiteSpace: "nowrap",
        zIndex: 100,
        animation: "toastIn 0.2s ease-out",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#00C47C" />
          <path d="M7 12.5L10.2 15.8L17 8.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{
          fontSize: 15,
          fontWeight: 600,
          lineHeight: 1.35,
          color: "rgba(0, 12, 30, 0.8)",
        }}>
          업로드를 완료했어요
        </span>
      </div>
    )}
    </>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  // node 92:4793 — flex-col, gap 24, pt 12, pb 52, px 20
  scroll: {
    flex: 1,
    overflowY: "auto",
    WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
    display: "flex",
    flexDirection: "column",
    gap: 24,
    paddingTop: 12,
    paddingBottom: 16,
    paddingLeft: 20,
    paddingRight: 20,
    boxSizing: "border-box",
  },

  // node 92:4794 — bg grey-100, gap 12, px 20, py 10, rounded 20
  petCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    padding: "10px 20px",
    backgroundColor: "#F2F4F6",
    borderRadius: 20,
    border: "none",
    cursor: "pointer",
    boxSizing: "border-box",
    textAlign: "left",
    outline: "none",
    WebkitTapHighlightColor: "transparent",
  },
  // node 92:4796 — ListRow: flex 1, min-h 44, py 8
  petListRow: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    minHeight: 44,
    paddingTop: 8,
    paddingBottom: 8,
    minWidth: 0,
  },
  petInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  petSubLabel: {
    margin: 0,
    fontSize: 13,
    fontWeight: 400,
    lineHeight: 1.35,
    color: "rgba(0,19,43,0.58)",
  },
  petName: {
    margin: 0,
    fontSize: 17,
    fontWeight: 700,
    lineHeight: 1.35,
    color: "rgba(0,12,30,0.8)",
  },
  arrowContainer: {
    width: 24,
    height: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  // node 92:4797 — flex-col, gap 24
  calendarBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },

  // node 92:4798 — flex-col, gap 16
  calendarSection: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  // node 92:4799 — flex, justify-between, items-center
  calendarHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  // node 92:4800 — flex, items-center
  monthGroup: {
    display: "flex",
    alignItems: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    outline: "none",
    WebkitTapHighlightColor: "transparent",
  },
  // node 92:4801 — SF Pro Bold 22 / 135% / #191F28
  monthLabel: {
    margin: 0,
    fontSize: 22,
    fontStyle: "normal",
    fontWeight: 700,
    lineHeight: "135%",
    color: "#191F28",
    whiteSpace: "nowrap",
  },
  // node 92:4802 — 32×32, rounded 11, overflow hidden, flex center
  monthArrowBtn: {
    display: "flex",
    width: 32,
    height: 32,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    boxSizing: "border-box",
    background: "none",
    border: "none",
    cursor: "pointer",
    borderRadius: 11,
    overflow: "hidden",
    flexShrink: 0,
    outline: "none",
    WebkitTapHighlightColor: "transparent",
  },

  skeleton: {
    height: 310,
    borderRadius: 12,
    backgroundColor: "#F2F4F6",
  },

  uploadSection: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  // node 92:4870 — SF Pro Bold 17 / 135% / #191F28
  dateLabel: {
    margin: 0,
    fontSize: 17,
    fontWeight: 700,
    lineHeight: "135%",
    color: "#191F28",
    whiteSpace: "nowrap",
  },

  // node 92:4877 — bg grey-100, px 20, py 10, rounded 20
  wallpaperBanner: {
    display: "flex",
    width: "100%",
    padding: "10px 20px",
    marginBottom: 40,
    backgroundColor: "#F2F4F6",
    borderRadius: 20,
    border: "none",
    cursor: "pointer",
    boxSizing: "border-box",
    textAlign: "left",
    outline: "none",
    WebkitTapHighlightColor: "transparent",
  },
  // node 92:4878 — ListRow: flex 1, min-h 44, py 8
  wallpaperListRow: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    minHeight: 44,
    paddingTop: 8,
    paddingBottom: 8,
    minWidth: 0,
  },
  wallpaperText: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  // SF Pro Bold 17 / 135% / rgba(0,12,30,0.8)
  wallpaperTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 700,
    lineHeight: "135%",
    color: "rgba(0,12,30,0.8)",
  },
  // SF Pro Regular 13 / 135% / rgba(0,19,43,0.58)
  wallpaperSubtitle: {
    margin: 0,
    fontSize: 13,
    fontWeight: 400,
    lineHeight: "135%",
    color: "rgba(0,19,43,0.58)",
  },
};

