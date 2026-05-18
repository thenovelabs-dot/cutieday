import { useState } from "react";
import AppNav from "../components/AppNav";

const ICON_DOG = "/assets/onboarding-icon-dog.svg";
const ICON_CAT = "/assets/onboarding-icon-cat.svg";
const ICON_OTHER = "/assets/onboarding-icon-other.svg";

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
  const [breedFocused, setBreedFocused] = useState(false);

  const canNext =
    selected !== null && (selected !== "기타" || breed.trim().length > 0);

  const handleNext = () => {
    if (!selected) return;
    onNext(selected, selected === "기타" ? breed.trim() : undefined);
  };

  return (
    <div style={s.container}>
      <style>{`.breed-input::placeholder { color: rgba(3,24,50,0.46); }`}</style>
      <AppNav showTitle onBack={onBack} />
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
                  backgroundColor: isSelected ? "#D1D6DB" : "#F9FAFB",
                }}
              >
                <img src={icon} alt={label} style={s.optionIcon} />
                <span
                  style={{
                    ...s.optionLabel,
                    color: isSelected ? "#333D4B" : "#4E5968",
                    fontWeight: isSelected ? 700 : 510,
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
            <p style={{ ...s.breedLabel, color: breedFocused ? "#2272EB" : "rgba(0,12,30,0.8)" }}>반려동물 종</p>
            <input
              style={{
                ...s.breedInput,
                background: breedFocused
                  ? "linear-gradient(90deg, rgba(26,122,249,0.05) 0%, rgba(26,122,249,0.05) 100%), linear-gradient(90deg, #F9FAFB 0%, #F9FAFB 100%)"
                  : "#F9FAFB",
              }}
              placeholder="반려동물 종 입력"
              className="breed-input"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              onFocus={() => setBreedFocused(true)}
              onBlur={() => setBreedFocused(false)}
              maxLength={20}
              autoFocus
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
          <button style={s.btnSecondary} onClick={onBack}>이전</button>
          <button
            style={{ ...s.btnPrimary, opacity: canNext ? 1 : 0.3 }}
            disabled={!canNext}
            onClick={handleNext}
          >
            다음
          </button>
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
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.15s",
    outline: "none",
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
    padding: "0 0 0",
    display: "flex",
    flexDirection: "column",
    gap: 0,
    width: "100%",
  },
  breedLabel: {
    margin: 0,
    padding: "16px 24px 6px",
    fontSize: 13,
    fontWeight: 510,
    color: "#2272EB",
    lineHeight: "1.35",
  },
  breedInput: {
    width: "100%",
    minHeight: 54,
    borderRadius: 14,
    border: "1px solid rgba(0,27,55,0.1)",
    padding: "14px 16px",
    fontSize: 17,
    fontWeight: 510,
    color: "rgba(0,12,30,0.8)",
    outline: "none",
    boxSizing: "border-box",
    background: "linear-gradient(90deg, rgba(26,122,249,0.05) 0%, rgba(26,122,249,0.05) 100%), linear-gradient(90deg, #F9FAFB 0%, #F9FAFB 100%)",
    margin: "0 20px",
    width: "calc(100% - 40px)",
  },
  breedHint: {
    margin: 0,
    padding: "8px 24px 0",
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
  btnSecondary: {
    flex: 1,
    height: 56,
    backgroundColor: "rgba(7,25,76,0.05)",
    color: "rgba(3,18,40,0.7)",
    fontSize: 17,
    fontWeight: 590,
    border: "none",
    borderRadius: 16,
    cursor: "pointer",
    outline: "none",
  },
  btnPrimary: {
    flex: 1,
    height: 56,
    backgroundColor: "#508FE1",
    color: "#fff",
    fontSize: 17,
    fontWeight: 590,
    border: "none",
    borderRadius: 16,
    cursor: "pointer",
    outline: "none",
  },
};
