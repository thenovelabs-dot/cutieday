import React, { useRef, useEffect } from "react";
import CalendarDateM, { type CalendarDateMState } from "./CalendarDateM";
import CalendarDateL, { type CalendarDateLState } from "./CalendarDateL";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function sundayOffset(d: Date): number {
  return d.getDay();
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

interface Props {
  type: "Month" | "Week";
  year: number;
  month: number;
  today?: Date;
  photoMap?: Map<string, string>;
  weekStartDate?: Date;
  onDayPress?: (dateStr: string) => void;
  selectedDateStr?: string | null;
}

export default function Calendar({
  type,
  year,
  month,
  today = new Date(),
  photoMap = new Map(),
  weekStartDate,
  onDayPress,
  selectedDateStr,
}: Props) {
  const todayStr = formatDate(today);
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  // 주별 뷰 전환 or 주차 변경 시 선택된 셀(없으면 오늘)이 보이도록 스크롤
  const weekStartKey = weekStartDate
    ? `${weekStartDate.getFullYear()}-${weekStartDate.getMonth()}-${weekStartDate.getDate()}`
    : null;

  useEffect(() => {
    if (type !== "Week") return;
    const container = scrollRef.current;
    const target = selectedRef.current ?? todayRef.current;
    if (!container || !target) return;

    const containerWidth = container.clientWidth;
    const cellLeft = target.offsetLeft;
    const cellWidth = target.offsetWidth;
    container.scrollLeft = cellLeft - (containerWidth - cellWidth) / 2;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, weekStartKey]);

  // ── 주별 뷰 ──────────────────────────────────────────────────────────────
  if (type === "Week") {
    const sunday = weekStartDate ?? (() => {
      const d = new Date(today);
      d.setDate(d.getDate() - sundayOffset(d));
      return d;
    })();

    const weekDays = WEEKDAYS.map((weekday, i) => {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const dateStr = formatDate(d);
      const imageUrl = photoMap.get(dateStr);
      const isToday = dateStr === todayStr;
      const isFuture = d > today && !isToday;

      const cellState: CalendarDateLState = imageUrl ? "Image"
        : isToday ? "Today"
        : isFuture ? "Default"
        : "Disabled";
      const isSelected = dateStr === selectedDateStr;

      return { d, dateStr, weekday, imageUrl, cellState, isSelected, isToday };
    });

    return (
      <div
        ref={scrollRef}
        className="hide-scrollbar"
        style={{
          display: "flex",
          width: "100%",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          WebkitTextSizeAdjust: "none",
          paddingLeft: 20,
          paddingRight: 20,
          paddingBottom: 4,
          boxSizing: "border-box",
        }}
      >
        {weekDays.map(({ d, dateStr, weekday, imageUrl, cellState, isSelected, isToday }) => (
          <div
            key={dateStr}
            ref={isSelected ? selectedRef : isToday ? todayRef : undefined}
            style={{ width: 110, flexShrink: 0, position: "relative", zIndex: isSelected ? 1 : 0 }}
          >
            <CalendarDateL
              state={cellState}
              selected={isSelected}
              day={d.getDate()}
              weekday={weekday}
              imageUrl={imageUrl}
              onClick={onDayPress ? () => onDayPress(dateStr) : undefined}
            />
          </div>
        ))}
      </div>
    );
  }

  // ── 월별 뷰 ──────────────────────────────────────────────────────────────
  const firstOffset = sundayOffset(new Date(year, month - 1, 1));
  const totalDays = getDaysInMonth(year, month);
  const cells: (number | null)[] = [
    ...Array(firstOffset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const isFutureMonth = new Date(year, month - 1) > new Date(today.getFullYear(), today.getMonth());

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", WebkitTextSizeAdjust: "none" }}>
      {/* 요일 헤더 */}
      <div style={{ display: "flex", width: "100%", justifyContent: "center", alignItems: "center" }}>
        {WEEKDAYS.map((wd) => (
          <div key={wd} style={{ width: 47, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 10px", boxSizing: "border-box" }}>
            <p style={s.weekdayLabel}>{wd}</p>
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {Array.from({ length: cells.length / 7 }, (_, rowIdx) => (
          <div key={rowIdx} style={{ display: "flex", width: "100%", justifyContent: "center", alignItems: "center" }}>
            {cells.slice(rowIdx * 7, rowIdx * 7 + 7).map((day, colIdx) => {
              if (day === null) {
                return <div key={`empty-${rowIdx}-${colIdx}`} style={{ width: 47, height: 47, flexShrink: 0 }} />;
              }

              const mm = String(month).padStart(2, "0");
              const dd = String(day).padStart(2, "0");
              const dateStr = `${year}-${mm}-${dd}`;
              const imageUrl = photoMap.get(dateStr);
              const isToday = isCurrentMonth && dateStr === todayStr;
              const isFuture = isFutureMonth || (isCurrentMonth && day > today.getDate());

              const isSelected = dateStr === selectedDateStr;
              const cellState: CalendarDateMState = imageUrl ? "Image"
                : isToday ? "Today"
                : isFuture ? "Default"
                : "Disabled";

              return (
                <div key={dateStr} style={{ width: 47, height: 47, flexShrink: 0, position: "relative", zIndex: isSelected ? 1 : 0 }}>
                  <CalendarDateM
                    state={cellState}
                    selected={isSelected}
                    day={day}
                    imageUrl={imageUrl}
                    onClick={onDayPress ? () => onDayPress(dateStr) : undefined}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  weekdayLabel: {
    margin: 0,
    fontSize: 13,
    fontWeight: 510,
    lineHeight: 1.252,
    textAlign: "center",
    color: "#B0B8C1",
  },
};
