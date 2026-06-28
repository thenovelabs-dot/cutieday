import React from "react";

const FOOTPRINT = "/assets/footprint.svg";

const BG_MAP: Record<"Brand" | "Black" | "Gray", string> = {
  Brand: "#508FE1",
  Black: "#000000",
  Gray: "#232323",
};

interface Props {
  color?: "Brand" | "Black" | "Gray";
  selected?: boolean;
  fixedBg?: string;
}

export default function ColorSelectUnit({ color = "Brand", selected = false, fixedBg }: Props) {
  const bg = fixedBg ?? BG_MAP[color];
  return (
    <div style={{
      position: "relative",
      width: 44,
      height: 44,
      borderRadius: 999,
      backgroundColor: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      boxSizing: "border-box",
    }}>
      {selected && (
        <>
          <img
            src={FOOTPRINT}
            alt=""
            style={{ width: 24, height: 24, opacity: 0.5, display: "block" }}
          />
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 41,
            height: 41,
            borderRadius: 999,
            border: "2.5px solid #fff",
            boxSizing: "border-box",
            pointerEvents: "none",
          }} />
        </>
      )}
    </div>
  );
}
