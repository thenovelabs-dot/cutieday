import React from "react";

interface Props {
  value: "Month" | "Week";
  onChange: (value: "Month" | "Week") => void;
}

export default function SegmentText({ value, onChange }: Props) {
  return (
    <div style={s.container}>
      {(["Month", "Week"] as const).map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            style={{ ...s.item, ...(active ? s.itemActive : {}) }}
            onClick={() => onChange(option)}
            onMouseDown={(e) => e.preventDefault()}
          >
            <span style={{ ...s.label, ...(active ? s.labelActive : {}) }}>
              {option === "Month" ? "월별" : "주별"}
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
