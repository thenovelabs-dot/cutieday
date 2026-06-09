import AnimalProfile from "./AnimalProfile";

interface Props {
  type: "week" | "month";
  animalType?: "Puppy" | "Cat";
  onClose: () => void;
  onGoWallpaper: () => void;
}

export default function SuccessPopup({ type, animalType = "Puppy", onClose, onGoWallpaper }: Props) {
  const isMonth = type === "month";
  const label = isMonth ? "한달" : "일주일";
  const wallpaperKind = isMonth ? "월간" : "주간";

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 200,
      padding: "0 32px",
    }}>
      <div style={{
        backgroundColor: "#fff",
        borderRadius: 24,
        width: 311,
        paddingTop: 40,
        paddingBottom: 20,
        paddingLeft: 20,
        paddingRight: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 40,
        boxSizing: "border-box",
      }}>
        {/* 상단 콘텐츠 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, width: "100%" }}>
          <AnimalProfile type={animalType} size={60} />

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%" }}>
            {/* 타이틀 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, lineHeight: 1.35, whiteSpace: "nowrap" }}>
              <span style={{ color: "#508FE1" }}>{label}</span>
              <span style={{ color: "#191F28" }}> 기록 성공!</span>
            </div>

            {/* 서브타이틀 */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontSize: 13, fontWeight: 510, lineHeight: 1.35, color: "#4E5968", textAlign: "center", width: "100%" }}>
              <p style={{ margin: 0 }}>
                <span style={{ color: "#508FE1" }}>{label} </span>
                <span>업로드를 성공했어요!</span>
              </p>
              <p style={{ margin: 0 }}>{wallpaperKind} 배경화면을 바로 만들어보세요.</p>
            </div>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div style={{ display: "flex", gap: 8, width: "100%" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              minHeight: 48,
              borderRadius: 14,
              border: "none",
              backgroundColor: "rgba(7, 25, 76, 0.05)",
              color: "rgba(3, 18, 40, 0.7)",
              fontSize: 17,
              fontWeight: 590,
              cursor: "pointer",
              outline: "none",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            닫기
          </button>
          <button
            onClick={onGoWallpaper}
            style={{
              flex: 1,
              minHeight: 48,
              borderRadius: 14,
              border: "none",
              backgroundColor: "#508FE1",
              color: "#fff",
              fontSize: 17,
              fontWeight: 590,
              cursor: "pointer",
              outline: "none",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            만들러가기
          </button>
        </div>
      </div>
    </div>
  );
}
