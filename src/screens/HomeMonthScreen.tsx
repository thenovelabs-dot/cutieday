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
    const dateStr = sessionStorage.getItem("pendingUploadDate") ?? sessionStorage.getItem("homeSelectedDate");
    if (dateStr) {
      const [y, m] = dateStr.split("-").map(Number);
      return new Date(y, m - 1, 1);
    }
    const homeView = sessionStorage.getItem("homeViewDate");
    if (homeView) {
      const [y, m] = homeView.split("-").map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [calendarType, setCalendarType] = useState<"Month" | "Week">(
    () => (sessionStorage.getItem("pendingCalendarType") as "Month" | "Week")
      ?? (sessionStorage.getItem("homeCalendarType") as "Month" | "Week")
      ?? "Month"
  );
  const [pet, setPet] = useState<Pet | null>(null);
  const [photoMap, setPhotoMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(
    () => sessionStorage.getItem("pendingUploadDate") ?? sessionStorage.getItem("homeSelectedDate")
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
    sessionStorage.removeItem("pendingCalendarType");
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setShowToast(true);
    toastTimerRef.current = setTimeout(() => setShowToast(false), 2000);
  }, []);

  useEffect(() => {
    if (selectedDateStr !== null) sessionStorage.setItem("homeSelectedDate", selectedDateStr);
    else sessionStorage.removeItem("homeSelectedDate");
  }, [selectedDateStr]);

  useEffect(() => {
    sessionStorage.setItem("homeCalendarType", calendarType);
  }, [calendarType]);

  useEffect(() => {
    const mm = String(viewDate.getMonth() + 1).padStart(2, "0");
    sessionStorage.setItem("homeViewDate", `${viewDate.getFullYear()}-${mm}`);
  }, [viewDate]);

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
          sessionStorage.removeItem("pendingUploadDate");
          sessionStorage.removeItem("pendingCalendarType");
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
        <div style={{ margin: "0 -20px" }}>
          <HomeBannerAd flat />
        </div>

        {/* 반려동물 프로필 카드 — node 92:4794 */}
        <button style={s.petCard} onClick={() => navigate("PetEdit")}>
          <AnimalProfile type={pet?.species === "고양이" ? "Cat" : "Puppy"} size={28} />
          <div style={s.petListRow}>
            <p style={s.petName}>{pet?.name ?? "반려동물"}</p>
            <div style={s.editBadge}>
              <span style={s.editBadgeText}>정보 수정</span>
            </div>
          </div>
        </button>

        {/* 업로드 카드 — 정보수정 카드 바로 아래 */}
        <HomeUploadCard
          type={isFuture ? "Future" : (photoMap.get(activeDateStr) ? "Upload" : "None")}
          petName={pet?.name ?? "반려동물"}
          date={activeDateStr}
          imageUrl={photoMap.get(activeDateStr)}
          onUpload={() => { pendingDateRef.current = activeDateStr; fileInputRef.current?.click(); }}
          onChangePhoto={() => { pendingDateRef.current = activeDateStr; fileInputRef.current?.click(); }}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            e.target.value = "";
            sessionStorage.setItem("pendingCalendarType", calendarType);
            navigate("ImageAdjust", { uri: URL.createObjectURL(file), date: pendingDateRef.current });
          }}
        />

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
              <SegmentText value={calendarType} onChange={handleCalendarTypeChange} options={["Month", "Week"]} />
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
        </div>


      </div>

      {/* 배경화면 만들기 버튼 — 하단 고정 오버레이 */}
      <div style={s.wallpaperSection}>
        <button style={s.wallpaperBtn} onClick={() => {
          const [dy, dm, dd] = activeDateStr.split("-").map(Number);
          navigate("Wallpaper", {
            initialType: "Day",
            initialDay: { year: dy, month: dm, day: dd },
          });
        }}>
          <svg width="18" height="18" viewBox="0 0 15.735 15.165" fill="none" style={{ flexShrink: 0 }}>
            <path d="M7.2825 10.29C7.44 10.4475 7.6575 10.53 7.8675 10.53C8.0775 10.53 8.2875 10.4475 8.4525 10.29L12.375 6.36C12.6975 6.0375 12.6975 5.5125 12.375 5.19C12.0525 4.8675 11.5275 4.8675 11.205 5.19L8.6925 7.7025V0.825C8.6925 0.3675 8.325 0 7.8675 0C7.41 0 7.0425 0.3675 7.0425 0.825V7.71L4.5225 5.1975C4.2 4.875 3.675 4.875 3.3525 5.1975C3.03 5.52 3.03 6.045 3.3525 6.3675L7.2825 10.29Z" fill="white" />
            <path d="M14.91 8.5575C14.4525 8.5575 14.085 8.925 14.085 9.3825V12.54C14.085 13.08 13.65 13.515 13.11 13.515H2.625C2.085 13.515 1.65 13.08 1.65 12.54V9.3825C1.65 8.925 1.2825 8.5575 0.825 8.5575C0.3675 8.5575 0 8.925 0 9.3825V12.54C0 13.9875 1.1775 15.165 2.625 15.165H13.11C14.5575 15.165 15.735 13.9875 15.735 12.54V9.3825C15.735 8.925 15.3675 8.5575 14.91 8.5575Z" fill="white" />
          </svg>
          <span style={s.wallpaperBtnText}>배경화면 만들기</span>
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
    position: "relative",
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
    gap: 16,
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
    gap: 8,
    width: "100%",
    padding: "12px 16px",
    backgroundColor: "#F2F4F6",
    borderRadius: 16,
    border: "none",
    cursor: "pointer",
    boxSizing: "border-box",
    textAlign: "left",
    outline: "none",
    WebkitTapHighlightColor: "transparent",
  },
  petListRow: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    minWidth: 0,
  },
  petName: {
    flex: 1,
    margin: 0,
    fontSize: 17,
    fontWeight: 700,
    lineHeight: 1.35,
    color: "rgba(0,12,30,0.8)",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  editBadge: {
    backgroundColor: "rgba(0,27,55,0.1)",
    borderRadius: 9,
    padding: "3px 7px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    alignSelf: "center",
  },
  editBadgeText: {
    fontSize: 10,
    fontWeight: 590,
    lineHeight: 1.5,
    color: "rgba(3,18,40,0.7)",
    whiteSpace: "nowrap",
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
    marginBottom: 72,
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

  wallpaperSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, white 66.346%)",
    padding: "8px 20px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    pointerEvents: "none",
  },
  wallpaperBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 48,
    minWidth: 80,
    paddingLeft: 16,
    paddingRight: 20,
    paddingTop: 2,
    paddingBottom: 2,
    backgroundColor: "#508FE1",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    overflow: "hidden",
    pointerEvents: "auto",
    outline: "none",
    WebkitTapHighlightColor: "transparent",
  },
  wallpaperBtnText: {
    fontSize: 15,
    fontWeight: 590,
    lineHeight: 1.252,
    color: "white",
    whiteSpace: "nowrap",
  },
};

