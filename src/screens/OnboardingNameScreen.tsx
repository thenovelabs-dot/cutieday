import { useState } from "react";
import { Button } from "@toss/tds-mobile";
import { supabase } from "../lib/supabase";
import { getUserKey } from "../lib/auth";
import AppNav from "../components/AppNav";

interface Props {
  species: string;
  breed?: string;
  onNext: () => void;
  onBack: () => void;
}

const SPECIAL_CHAR_REGEX = /[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s]/;

type ValidationError = "tooLong" | "specialChar" | null;

function validate(name: string): ValidationError {
  if (name.length > 10) return "tooLong";
  if (SPECIAL_CHAR_REGEX.test(name)) return "specialChar";
  return null;
}

export default function OnboardingNameScreen({ species, breed, onNext, onBack }: Props) {
  const [name, setName] = useState("");
  const [error, setError] = useState<ValidationError>(null);
  const [focused, setFocused] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setError(validate(val));
  };

  const canNext = name.trim().length > 0 && error === null && !saving;

  const handleNext = async () => {
    if (!canNext) return;
    const userKey = getUserKey();
    if (!userKey) return;

    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from("pets")
        .select("id")
        .eq("user_id", userKey)
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { error: dbError } = await supabase
          .from("pets")
          .update({ name: name.trim(), species, breed: breed ?? null })
          .eq("id", existing.id);
        if (dbError) throw dbError;
      } else {
        const { error: dbError } = await supabase.from("pets").insert({
          user_id: userKey,
          name: name.trim(),
          species,
          breed: breed ?? null,
        });
        if (dbError) throw dbError;
      }
      onNext();
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  };

  const hasError = error !== null;
  const errorMessage =
    error === "tooLong"
      ? "10자 이내로 입력해주세요"
      : error === "specialChar"
      ? "특수문자는 사용할 수 없어요"
      : "";

  return (
    <div style={s.container}>
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
          <h1 style={s.title}>반려동물 이름을 알려주세요</h1>
          <p style={s.subtitle}>10자 이내로 입력해주세요.</p>
        </div>

        {/* 이름 입력 */}
        <div style={s.inputWrap}>
          <input
            style={{
              ...s.input,
              borderColor: hasError ? "#E53E3E" : focused ? "#3182F6" : "rgba(0,27,55,0.1)",
              background: hasError
                ? "#FFF5F5"
                : focused
                ? "linear-gradient(90deg, rgba(26,122,249,0.05) 0%, rgba(26,122,249,0.05) 100%), linear-gradient(90deg, #F9FAFB 0%, #F9FAFB 100%)"
                : "#F9FAFB",
            }}
            placeholder="반려동물 이름"
            value={name}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            maxLength={20}
            autoFocus
          />
          {hasError && (
            <p style={s.errorText}>{errorMessage}</p>
          )}
        </div>
      </div>

      {/* 하단 CTA */}
      <div style={s.bottomCta}>
        <div style={s.gradient} />
        <div style={s.buttonRow}>
          <button style={s.btnSecondary} disabled={saving} onClick={onBack}>이전</button>
          <button
            style={{ ...s.btnPrimary, opacity: canNext && !saving ? 1 : 0.3 }}
            disabled={!canNext || saving}
            onClick={handleNext}
          >
            {saving ? "저장 중..." : "시작하기"}
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
    width: "66%",
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
  inputWrap: {
    padding: "24px 20px 0",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  input: {
    width: "100%",
    minHeight: 54,
    borderRadius: 14,
    border: "1px solid",
    padding: "14px 16px",
    fontSize: 17,
    fontWeight: 510,
    color: "rgba(0,12,30,0.8)",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s, background-color 0.15s",
  },
  errorText: {
    margin: 0,
    fontSize: 13,
    color: "#E53E3E",
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
