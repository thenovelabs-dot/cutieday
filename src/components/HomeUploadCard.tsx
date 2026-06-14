import React from "react";

interface Props {
  type: "None" | "Upload" | "Future";
  petName: string;
  date: string; // "YYYY-MM-DD"
  imageUrl?: string;
  onUpload: () => void;
  onChangePhoto: () => void;
}

function formatDateLabel(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  return `${Number(m)}월 ${Number(d)}일`;
}

export default function HomeUploadCard({ type, petName, date, imageUrl, onUpload, onChangePhoto }: Props) {
  const dateLabel = formatDateLabel(date);

  if (type === "Future") {
    return (
      <div style={s.container}>
        <div style={s.textGroup}>
          <p style={s.dateText}>{dateLabel}</p>
          <p style={s.mainText}>미리 업로드할 수 없어요.</p>
        </div>
      </div>
    );
  }

  if (type === "None") {
    return (
      <div style={s.container}>
        <div style={s.textGroup}>
          <p style={s.dateText}>{dateLabel}</p>
          <p style={s.mainText}>{`오늘의 ${petName}가\n없어요.`}</p>
        </div>
        <button style={s.uploadBtn} onClick={onUpload}>
          <span style={s.btnText}>업로드하기</span>
        </button>
      </div>
    );
  }

  // Upload 상태
  return (
    <div style={s.uploadContainer}>
      <div style={s.imageBg} />
      {imageUrl && <img src={imageUrl} alt="오늘의 사진" style={s.image} />}
      <div style={s.overlay}>
        <div style={s.dateBadge}>
          <span style={s.dateBadgeText}>{dateLabel}</span>
        </div>
        <div style={s.changeRow}>
          <button style={s.changeBtn} onClick={onChangePhoto}>
            <span style={s.btnText}>변경하기</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  // None / Future 공통 컨테이너
  container: {
    width: "100%",
    height: 280,
    flexShrink: 0,
    backgroundColor: "#F2F4F6",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: "14px 16px",
    boxSizing: "border-box",
  },
  textGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  dateText: {
    margin: 0,
    fontSize: 15,
    fontWeight: 590,
    lineHeight: 1.252,
    color: "rgba(0,19,43,0.58)",
    textAlign: "center",
  },
  mainText: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1.35,
    color: "rgba(0,12,30,0.8)",
    textAlign: "center",
    whiteSpace: "pre-line",
  },

  // 버튼 공통
  uploadBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 38,
    minWidth: 64,
    padding: "2px 16px",
    backgroundColor: "#508FE1",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    overflow: "hidden",
    boxSizing: "border-box",
    outline: "none",
    WebkitTapHighlightColor: "transparent",
  },
  btnText: {
    fontSize: 15,
    fontWeight: 590,
    lineHeight: 1.252,
    color: "white",
    textAlign: "center",
    whiteSpace: "nowrap",
  },

  // Upload 상태
  uploadContainer: {
    width: "100%",
    height: 280,
    flexShrink: 0,
    borderRadius: 16,
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  imageBg: {
    position: "absolute",
    inset: 0,
    backgroundColor: "#F2F4F6",
    borderRadius: 16,
  },
  image: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    borderRadius: 16,
  },
  overlay: {
    position: "absolute",
    inset: 0,
    padding: "14px 16px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  dateBadge: {
    backgroundColor: "rgba(0,29,58,0.18)",
    borderRadius: 11,
    padding: "3px 7px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  dateBadgeText: {
    fontSize: 12,
    fontWeight: 700,
    lineHeight: "18px",
    color: "white",
    whiteSpace: "nowrap",
  },
  changeRow: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
  },
  changeBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 38,
    minWidth: 64,
    padding: "2px 16px",
    backgroundColor: "#4E5968",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    overflow: "hidden",
    boxSizing: "border-box",
    outline: "none",
    WebkitTapHighlightColor: "transparent",
  },
};
