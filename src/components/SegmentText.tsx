import React from "react";

type SegmentValue = "Month" | "Week" | "Day";

interface Props {
  value: SegmentValue;
  onChange: (value: SegmentValue) => void;
  options?: SegmentValue[];
}

const ALL_OPTIONS: { key: SegmentValue; label: string }[] = [
  { key: "Month", label: "월별" },
  { key: "Week",  label: "주별" },
  { key: "Day",   label: "일별" },
];

export default function SegmentText({ value, onChange, options }: Props) {
  const visibleOptions = options
    ? ALL_OPTIONS.filter((o) => options.includes(o.key))
    : ALL_OPTIONS;
  return (
    <div style={s.container}>
      {visibleOptions.map(({ key, label }) => {
        const active = value === key;
        return (
          <button
            key={key}
            style={{ ...s.item, ...(active ? s.itemActive : {}) }}
            onClick={() => onChange(key)}
            onMouseDown={(e) => e.preventDefault()}
          >
            <span style={{ ...s.label, ...(active ? s.labelActive : {}) }}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#F2F4F6",
    borderRadius: 9999,
    padding: 2,
  },
  item: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 12px",
    borderRadius: 9999,
    border: "none",
    background: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    outline: "none",
    WebkitTapHighlightColor: "transparent",
  },
  itemActive: {
    backgroundColor: "#333D4B",
  },
  label: {
    fontSize: 13,
    fontWeight: 510,
    lineHeight: 1.252,
    whiteSpace: "nowrap",
    color: "rgba(0,19,43,0.58)",
  },
  labelActive: {
    color: "white",
  },
};
