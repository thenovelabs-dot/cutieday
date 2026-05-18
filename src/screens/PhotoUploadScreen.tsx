import { useState, useEffect } from "react";
import { BottomSheet } from "@toss/tds-mobile";

interface Props {
  onCamera: () => void;
  onAlbum: () => void;
  onClose: () => void;
}

export default function PhotoUploadScreen({ onCamera, onAlbum, onClose }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function go(callback: () => void) {
    setOpen(false);
    setTimeout(callback, 280);
  }

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <BottomSheet
        open={open}
        onClose={() => go(onClose)}
        header={<BottomSheet.Header>사진 업로드</BottomSheet.Header>}
      >
        <div style={s.list}>
          <button style={s.item} onClick={() => go(onCamera)}>
            <img src="/assets/icon-camera.svg" style={s.icon} alt="" />
            <span style={s.label}>사진 촬영하기</span>
          </button>
          <div style={s.sep} />
          <button style={s.item} onClick={() => go(onAlbum)}>
            <img src="/assets/icon-album.svg" style={s.icon} alt="" />
            <span style={s.label}>앨범에서 선택하기</span>
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  list: { padding: "0 20px 20px" },
  item: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    width: "100%",
    padding: "16px 4px",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  },
  icon: { width: 24, height: 24, flexShrink: 0 },
  label: { fontSize: 16, fontWeight: 500, color: "#191F28" },
  sep: { height: 1, backgroundColor: "#F2F4F6" },
};
