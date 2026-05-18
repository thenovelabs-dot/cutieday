import { useEffect, useRef } from "react";

interface Props {
  onSelect: (uri: string) => void;
  onBack: () => void;
}

export default function HomeAlbumScreen({ onSelect, onBack }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.click(), 100);
    return () => clearTimeout(t);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onSelect(URL.createObjectURL(file));
  }

  return (
    <div style={s.wrap}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleChange}
      />
      <div style={s.nav}>
        <button style={s.backBtn} onClick={onBack}>
          ← 돌아가기
        </button>
      </div>
      <div style={s.center}>
        <p style={s.hint}>앨범이 열리지 않으면</p>
        <button style={s.trigger} onClick={() => inputRef.current?.click()}>
          앨범 열기
        </button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "white",
  },
  nav: { padding: "16px 20px" },
  backBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    color: "#191F28",
    padding: 0,
  },
  center: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  hint: { margin: 0, fontSize: 15, color: "rgba(0,19,43,0.58)" },
  trigger: {
    padding: "14px 28px",
    backgroundColor: "#3182F6",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
  },
};
