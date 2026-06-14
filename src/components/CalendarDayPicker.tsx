import React, { useRef, useEffect, useState, useCallback } from "react";

const ITEM_H = 40;
const VISIBLE = 3;
const CONTAINER_H = ITEM_H * VISIBLE;

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR + 1 - 2025 + 1 }, (_, i) => 2025 + i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function getDays(year: number, month: number): number[] {
  const count = new Date(year, month, 0).getDate();
  return Array.from({ length: count }, (_, i) => i + 1);
}

interface PickerProps {
  items: number[];
  value: number;
  onChange: (v: number) => void;
  label: string;
  formatLabel?: (v: number) => string;
}

function ScrollPicker({ items, value, onChange, label, formatLabel }: PickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [selectedIdx, setSelectedIdx] = useState(() => {
    const i = items.indexOf(value);
    return i === -1 ? 0 : i;
  });
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const i = items.indexOf(value);
    const idx = i === -1 ? 0 : i;
    el.scrollTop = idx * ITEM_H;
    setSelectedIdx(idx);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    setSelectedIdx(clamped);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      el.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
      onChange(items[clamped]);
    }, 120);
  }, [items, onChange]);

  return (
    <div style={ps.col}>
      <p style={ps.colLabel}>{label}</p>
      <div ref={ref} onScroll={handleScroll} className="hide-scrollbar" style={ps.scroll}>
        <div style={{ height: ITEM_H }} />
        {items.map((item, i) => (
          <div
            key={item}
            style={{
              ...ps.item,
              backgroundColor: i === selectedIdx ? "rgba(2,32,71,0.05)" : "transparent",
              borderRadius: i === selectedIdx ? 12 : 0,
            }}
          >
            <span style={{
              fontSize: 17,
              fontWeight: i === selectedIdx ? 600 : 500,
              color: i === selectedIdx ? "#333D4B" : "#B0B8C1",
              lineHeight: "1.35",
            }}>
              {formatLabel ? formatLabel(item) : item}
            </span>
          </div>
        ))}
        <div style={{ height: ITEM_H }} />
      </div>
    </div>
  );
}

interface Props {
  initialYear: number;
  initialMonth: number;
  initialDay: number;
  onConfirm: (year: number, month: number, day: number) => void;
  onClose: () => void;
}

export default function CalendarDayPicker({ initialYear, initialMonth, initialDay, onConfirm, onClose }: Props) {
  const [tempYear, setTempYear] = useState(initialYear);
  const [tempMonth, setTempMonth] = useState(initialMonth);
  const [tempDay, setTempDay] = useState(initialDay);
  const [open, setOpen] = useState(false);

  const days = getDays(tempYear, tempMonth);

  useEffect(() => {
    const max = getDays(tempYear, tempMonth).length;
    if (tempDay > max) setTempDay(max);
  }, [tempYear, tempMonth, tempDay]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setTimeout(onClose, 280);
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    setOpen(false);
    setTimeout(() => onConfirm(tempYear, tempMonth, tempDay), 280);
  }, [onConfirm, tempYear, tempMonth, tempDay]);

  return (
    <div
      style={{
        ...s.overlay,
        backgroundColor: open ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0)",
        transition: "background-color 0.28s ease",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          ...s.sheet,
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.28s cubic-bezier(0.32,0.72,0,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={s.handleArea}>
          <div style={s.handle} />
        </div>

        <div style={s.pickerRow}>
          <ScrollPicker items={YEARS} value={tempYear} onChange={setTempYear} label="년" />
          <ScrollPicker items={MONTHS} value={tempMonth} onChange={setTempMonth} label="월" />
          <ScrollPicker
            key={`day-${tempYear}-${tempMonth}`}
            items={days}
            value={Math.min(tempDay, days.length)}
            onChange={setTempDay}
            label="일"
          />
        </div>

        <div style={s.btnRow}>
          <button style={s.btnClose} onClick={handleClose}>닫기</button>
          <button style={s.btnConfirm} onClick={handleConfirm}>확인</button>
        </div>
      </div>
    </div>
  );
}

const ps: Record<string, React.CSSProperties> = {
  col: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 0 },
  colLabel: { margin: 0, fontSize: 13, fontWeight: 600, color: "#6B7684", lineHeight: "1.252", textAlign: "center", width: "100%" },
  scroll: { height: CONTAINER_H, overflowY: "auto", width: "100%", WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"] },
  item: { height: ITEM_H, display: "flex", alignItems: "center", justifyContent: "center" },
};

const s: Record<string, React.CSSProperties> = {
  overlay: { position: "fixed", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 1000, padding: 10 },
  sheet: { backgroundColor: "#fff", borderRadius: 28, paddingBottom: 20, width: "100%", boxSizing: "border-box" },
  handleArea: { display: "flex", justifyContent: "center", paddingTop: 16, paddingBottom: 4 },
  handle: { width: 48, height: 4, borderRadius: 40, backgroundColor: "#E5E8EB" },
  pickerRow: { display: "flex", gap: 12, paddingTop: 20, paddingLeft: 20, paddingRight: 20, height: 163, boxSizing: "border-box", overflow: "hidden", alignItems: "flex-start" },
  btnRow: { display: "flex", gap: 8, paddingTop: 34, paddingLeft: 20, paddingRight: 20 },
  btnClose: { flex: 1, height: 56, borderRadius: 16, border: "none", backgroundColor: "rgba(7,25,76,0.05)", color: "rgba(3,18,40,0.7)", fontSize: 17, fontWeight: 600, cursor: "pointer", outline: "none" },
  btnConfirm: { flex: 1, height: 56, borderRadius: 16, border: "none", backgroundColor: "#508FE1", color: "#fff", fontSize: 17, fontWeight: 600, cursor: "pointer", outline: "none" },
};
