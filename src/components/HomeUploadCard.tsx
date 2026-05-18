import React from "react";

interface Props {
  type: "None" | "Upload" | "Future";
  petName: string;
  imageUrl?: string;
  onUpload: () => void;
  onChangePhoto: () => void;
}

export default function HomeUploadCard({ type, petName, imageUrl, onUpload, onChangePhoto }: Props) {
  if (type === "Future") {
    return (
      <div style={{ ...s.noneContainer, minHeight: 147 }}>
        <p style={s.noneText}>미리 업로드할 수 없어요.</p>
      </div>
    );
  }

  if (type === "None") {
    return (
      <div style={s.noneContainer}>
        <p style={s.noneText}>아직 오늘의 {petName}가 없어요.</p>
        <button style={s.btn} onClick={onUpload}>
          <span style={s.btnText}>업로드하기</span>
        </button>
      </div>
    );
  }

  return (
    <div style={s.uploadContainer}>
      {imageUrl && (
        <div style={s.thumbnailWrapper}>
          <img src={imageUrl} alt="오늘의 사진" style={s.thumbnail} />
        </div>
      )}
      <div style={s.content}>
        <div style={s.textBlock}>
          <p style={s.subLabel}>오늘의</p>
          <p style={s.petName}>{petName} ❤️</p>
        </div>
        <button style={{ ...s.btn, width: "100%" }} onClick={onChangePhoto}>
          <span style={s.btnText}>변경하기</span>
        </button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  // None 상태 — node 12:6456
  noneContainer: {
    width: "100%",
    backgroundColor: "#F2F4F6",
    borderRadius: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: "40px 20px",
    boxSizing: "border-box",
  },
  noneText: {
    margin: 0,
    fontSize: 15,
    fontWeight: 700,
    lineHeight: 1.252,
    color: "#8B95A1",
    textAlign: "center",
    width: "100%",
  },

  // 버튼 — node 12:6453 / 12:6470
  btn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 32,
    minWidth: 52,
    padding: "2px 10px",
    backgroundColor: "#508FE1",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  btnText: {
    fontSize: 13,
    fontWeight: 590,
    lineHeight: 1.252,
    color: "white",
    textAlign: "center",
  },

  // Upload 상태 — node 12:6464
  uploadContainer: {
    width: "100%",
    backgroundColor: "#F2F4F6",
    borderRadius: 20,
    display: "flex",
    alignItems: "stretch",
    gap: 20,
    boxSizing: "border-box",
    overflow: "hidden",
  },
  thumbnailWrapper: {
    width: 119,
    alignSelf: "stretch",
    flexShrink: 0,
    overflow: "hidden",
    borderRadius: 20,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  content: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    gap: 16,
    paddingRight: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  textBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  subLabel: {
    margin: 0,
    fontSize: 13,
    fontWeight: 510,
    lineHeight: 1.252,
    color: "#4E5968",
  },
  petName: {
    margin: 0,
    fontSize: 15,
    fontWeight: 700,
    lineHeight: 1.252,
    color: "#333D4B",
  },
};
