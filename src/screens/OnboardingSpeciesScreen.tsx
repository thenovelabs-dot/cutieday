import { useState } from "react";
import { Button } from "@toss/tds-mobile";

// TODO: 로컬 에셋으로 교체 필요 (Figma URL 7일 후 만료)
const ICON_DOG = "https://www.figma.com/api/mcp/asset/97941d6d-8a0d-4fc1-81d5-a057817624ba";
const ICON_CAT = "https://www.figma.com/api/mcp/asset/668705a5-f918-4527-8c84-4326ade64594";
const ICON_OTHER = "https://www.figma.com/api/mcp/asset/faa9065c-9df7-4a2f-97c5-6b59c9d4468e";

type Species = "강아지" | "고양이" | "기타";

interface Props {
  onNext: (species: Species, breed?: string) => void;
  onBack: () => void;
}

const OPTIONS: { label: Species; icon: string }[] = [
  { label: "강아지", icon: ICON_DOG },
  { label: "고양이", icon: ICON_CAT },
  { label: "기타", icon: ICON_OTHER },
];

export default function OnboardingSpeciesScreen({ onNext, onBack }: Props) {
  const [selected, setSelected] = useState<Species | null>(null);
  const [breed, setBreed] = useState("");

  const canNext =
    selected !== null && (selected !== "기타" || breed.trim().length > 0);

  const handleNext = () => {
    if (!selected) return;
    onNext(selected, selected === "기타" ? breed.trim() : undefined);
  };

  return (
    <div style={s.container}>
      <div style={s.content}>
        {/* 프로그레스 바 */}
        <div style={s.progressWrap}>
          <div style={s.progressTrack}>
            <div style={s.progressFill} />
          </div>
        </div>

        {/* 타이틀 */}
        <div style={s.titleSection}>
          <h1 style={s.title}>반려동물의 종을 선택해주세요</h1>
          <p style={s.subtitle}>
            강아지나 고양이가 아니라면 '그외'를 선택해주세요.
          </p>
        </div>

        {/* 종 선택 카드 */}
        <div style={s.optionRow}>
          {OPTIONS.map(({ label, icon }) => {
            const isSelected = selected === label;
            return (
              <button
                key={label}
                onClick={() => setSelected(label)}
                style={{
                  ...s.optionCard,
                  backgroundColor: isSelected ? "#EBF3FE" : "#F9FAFB",
                  border: isSelected
                    ? "1.5px solid #3182F6"
                    : "1.5px solid transparent",
                }}
              >
                <img src={icon} alt={label} style={s.optionIcon} />
                <span
                  style={{
                    ...s.optionLabel,
                    color: isSelected ? "#3182F6" : "#4E5968",
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* 그외 선택 시 품종 입력 */}
        {selected === "기타" && (
          <div style={s.breedWrap}>
            <input
              style={s.breedInput}
              placeholder="반려동물 종을 입력해주세요"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              maxLength={20}
            />
            <p style={s.breedHint}>
              해당 종이 많아지면, 업데이트 시 캐릭터가 반영될 수 있어요.
            </p>
          </div>
        )}
      </div>

      {/* 하단 CTA */}
      <div style={s.bottomCta}>
        <div style={s.gradient} />
        <div style={s.buttonRow}>
          <Button
            variant="weak"
            style={{ flex: 1 }}
            onClick={onBack}
          >
            이전
          </Button>
          <Button
            style={{ flex: 1 }}
            disabled={!canNext}
            onClick={handleNext}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    backgroundColor: "white",
    overflow: "hidden",
  },
  content: {
    flex: 1,
    overflowY: "auto",
  },
  progressWrap: {
    padding: "12px 20px 0",
  },
  progressTrack: {
    height: 5,
    backgroundColor: "#E5E8EB",
    borderRadius: 2.5,
    overflow: "hidden",
  },
  progressFill: {
    height: 5,
    width: "33%",
    backgroundColor: "#3182F6",
    borderRadius: 2.5,
  },
  titleSection: {
    padding: "24px 24px 0",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    lineHeight: "37px",
    color: "#191F28",
    letterSpacing: -0.3,
  },
  subtitle: {
    margin: 0,
    marginTop: 4,
    fontSize: 15,
    fontWeight: 400,
    lineHeight: "25.5px",
    color: "rgba(3,18,40,0.7)",
  },
  optionRow: {
    display: "flex",
    gap: 8,
    padding: "24px 20px 0",
  },
  optionCard: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    padding: 18,
    borderRadius: 16,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  optionIcon: {
    width: 32,
    height: 32,
    objectFit: "contain",
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: 510,
    lineHeight: "18.78px",
  },
  breedWrap: {
    padding: "16px 20px 0",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  breedInput: {
    width: "100%",
    height: 52,
    borderRadius: 10,
    border: "1.5px solid #3182F6",
    padding: "0 16px",
    fontSize: 15,
    color: "#191F28",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "white",
  },
  breedHint: {
    margin: 0,
    fontSize: 13,
    color: "rgba(0,19,43,0.58)",
    lineHeight: "19px",
  },
  bottomCta: {
    flexShrink: 0,
    backgroundColor: "white",
  },
  gradient: {
    height: 36,
    background: "linear-gradient(to bottom, rgba(255,255,255,0), white)",
    marginTop: -36,
    pointerEvents: "none",
  },
  buttonRow: {
    display: "flex",
    gap: 8,
    padding: "0 20px 20px",
  },
};
