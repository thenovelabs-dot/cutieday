import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getUserKey } from "../lib/auth";
import AppNav from "../components/AppNav";

interface Props {
  onBack: () => void;
}

type Species = "강아지" | "고양이" | "기타";

interface PetData {
  id: string;
  name: string;
  species: Species;
  breed: string | null;
}

const SPECIAL_CHAR_REGEX = /[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s]/;

function validateName(v: string): string {
  if (v.length > 10) return "10자 이내로 입력해주세요.";
  if (SPECIAL_CHAR_REGEX.test(v)) return "특수문자는 사용할 수 없어요";
  return "";
}

const SPECIES_ICON: Record<Species, string> = {
  강아지: "/assets/onboarding-icon-dog.svg",
  고양이: "/assets/onboarding-icon-cat.svg",
  기타: "/assets/onboarding-icon-other.svg",
};
const SPECIES_LABELS: Record<Species, string> = { 강아지: "강아지", 고양이: "고양이", 기타: "그외" };

export default function PetEditScreen({ onBack }: Props) {
  const [pet, setPet] = useState<PetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState("");
  const [species, setSpecies] = useState<Species>("강아지");
  const [breed, setBreed] = useState("");
  const [nameError, setNameError] = useState("");
  const [nameFocused, setNameFocused] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const userKey = getUserKey();
    if (!userKey) { setLoading(false); return; }
    supabase
      .from("pets")
      .select("id, name, species, breed")
      .eq("user_id", userKey)
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          const p = data as PetData;
          setPet(p);
          setName(p.name);
          setSpecies(p.species);
          setBreed(p.breed ?? "");
        }
        setLoading(false);
      });
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setName(v);
    setNameError(validateName(v));
  };

  const nameChanged = name.trim() !== pet?.name;
  const speciesChanged =
    species !== pet?.species ||
    (species === "기타" && breed.trim() !== (pet?.breed ?? ""));
  const hasError = nameError !== "";
  const canSave = (nameChanged || speciesChanged) && !hasError && name.trim().length > 0;

  const handleSave = async () => {
    if (!canSave || !pet) return;
    setSaving(true);
    try {
      const updates = {
        name: name.trim(),
        species,
        breed: species === "기타" ? (breed.trim() || null) : null,
      };
      const { error } = await supabase.from("pets").update(updates).eq("id", pet.id);
      if (error) throw error;
      setPet({ ...pet, ...updates });
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseEdit = () => {
    if (!pet) return;
    setName(pet.name);
    setSpecies(pet.species);
    setBreed(pet.breed ?? "");
    setNameError("");
    setIsEditing(false);
  };

  const displaySpecies = pet?.species ?? "강아지";

  return (
    <div style={s.container}>
      <AppNav onBack={onBack} onClose={onBack} showTitle={false} />

      {/* 콘텐츠 */}
      <div style={s.content}>
        {loading ? (
          <div style={s.center}>
            <p style={s.dimText}>불러오는 중...</p>
          </div>
        ) : !pet ? (
          <div style={s.center}>
            <p style={s.dimText}>반려동물 정보를 찾을 수 없어요.</p>
          </div>
        ) : !isEditing ? (
          /* 보기 상태 */
          <div style={s.viewBody}>
            <div style={s.section}>
              <p style={s.sectionLabel}>반려동물 이름</p>
              <p style={s.petName}>{pet.name}</p>
            </div>
            <div style={s.section}>
              <p style={s.sectionLabel}>반려동물 종</p>
              <div style={s.speciesCardWrap}>
                <div style={s.speciesCard}>
                  <img src={SPECIES_ICON[displaySpecies]} alt={displaySpecies} style={s.speciesEmoji} />
                  <span style={s.speciesCardText}>
                    {displaySpecies === "기타" && pet.breed ? pet.breed : SPECIES_LABELS[displaySpecies]}
                  </span>
                </div>
              </div>
            </div>
            <div style={s.editBtnWrap}>
              <button style={s.editPillBtn} onClick={() => setIsEditing(true)}>
                <svg width="16" height="16" viewBox="0 0 14.2527 14.2527" fill="none" style={{ flexShrink: 0 }}>
                  <path fillRule="evenodd" clipRule="evenodd" d="M7.41857 2.69347L1.37724 8.7348L0.553236 11.8081L0.0112357 13.8328C-0.00381878 13.8894 -0.00374363 13.9489 0.0114536 14.0054C0.0266509 14.0619 0.0564366 14.1135 0.0978263 14.1549C0.139216 14.1963 0.190756 14.2261 0.247283 14.2412C0.30381 14.2564 0.363338 14.2565 0.419902 14.2415L2.44324 13.6988L5.51724 12.8748H5.5179L11.5592 6.83347L7.41924 2.69347H7.41857ZM14.0572 3.39347L10.8599 0.195467C10.798 0.133504 10.7246 0.0843451 10.6437 0.0508046C10.5628 0.0172641 10.4761 0 10.3886 0C10.301 0 10.2143 0.0172641 10.1334 0.0508046C10.0526 0.0843451 9.97909 0.133504 9.91724 0.195467L8.26724 1.8448L12.4079 5.98547L14.0572 4.33547C14.1192 4.27361 14.1684 4.20014 14.2019 4.11926C14.2354 4.03839 14.2527 3.95169 14.2527 3.86413C14.2527 3.77658 14.2354 3.68988 14.2019 3.60901C14.1684 3.52813 14.1192 3.45466 14.0572 3.3928" fill="#8B95A1" />
                </svg>
                <span style={s.editPillText}>편집하기</span>
              </button>
            </div>
          </div>
        ) : (
          /* 편집 상태 */
          <div style={s.editBody}>
            {/* 이름 필드 */}
            <div style={s.fieldGroup}>
              <p style={{
                ...s.sectionLabel,
                color: hasError ? "#E53E3E" : nameFocused ? "#2272EB" : "rgba(3,18,40,0.7)",
              }}>반려동물 이름</p>
              <div style={s.textFieldWrap}>
                <input
                  style={{
                    ...s.textField,
                    borderColor: hasError ? "#E53E3E" : nameFocused ? "#3182F6" : "rgba(0,27,55,0.1)",
                    backgroundColor: hasError ? "#FFF5F5" : undefined,
                    background: hasError
                      ? "#FFF5F5"
                      : nameFocused
                      ? "linear-gradient(90deg, rgba(26,122,249,0.05) 0%, rgba(26,122,249,0.05) 100%), linear-gradient(90deg, #F9FAFB 0%, #F9FAFB 100%)"
                      : "#F9FAFB",
                  }}
                  placeholder="10자 이내로 입력해주세요."
                  value={name}
                  onChange={handleNameChange}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  maxLength={20}
                  autoFocus
                />
                <p style={{ ...s.hintText, color: hasError ? "#E53E3E" : "rgba(0,19,43,0.58)" }}>
                  {hasError ? nameError : "10자 이내로 입력해주세요."}
                </p>
              </div>
            </div>

            {/* 종 선택 */}
            <div style={s.fieldGroup}>
              <p style={s.sectionLabel}>반려동물 종</p>
              <div style={s.speciesRow}>
                {(["강아지", "고양이", "기타"] as Species[]).map((sp) => (
                  <button
                    key={sp}
                    style={{
                      ...s.speciesChip,
                      backgroundColor: species === sp ? "#D1D6DB" : "#F9FAFB",
                    }}
                    onClick={() => setSpecies(sp)}
                  >
                    <img src={SPECIES_ICON[sp]} alt={sp} style={s.speciesEmoji} />
                    <span style={{
                      ...s.speciesChipText,
                      fontWeight: species === sp ? 700 : 510,
                      color: species === sp ? "#333D4B" : "#4E5968",
                    }}>
                      {SPECIES_LABELS[sp]}
                    </span>
                  </button>
                ))}
              </div>
              {species === "기타" && (
                <div style={s.breedWrap}>
                  <input
                    style={{ ...s.textField, borderColor: "rgba(0,27,55,0.1)", backgroundColor: "#F9FAFB" }}
                    placeholder="반려동물 종을 입력해주세요"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                  />
                  <p style={s.hintText}>
                    해당 종이 많아지면, 업데이트 시 캐릭터가 반영될 수 있어요.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 하단 버튼 — 편집 상태에서만 */}
      {isEditing && (
        <div style={s.bottom}>
          <button style={s.btnClose} onClick={handleCloseEdit} disabled={saving}>
            닫기
          </button>
          <button
            style={{ ...s.btnConfirm, opacity: (!canSave || saving) ? 0.4 : 1 }}
            disabled={!canSave || saving}
            onClick={handleSave}
          >
            {saving ? "저장 중..." : "완료"}
          </button>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "white",
  },
  content: {
    flex: 1,
    overflowY: "auto",
  },
  center: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  dimText: { margin: 0, fontSize: 15, color: "#8B95A1" },

  /* 보기 상태 */
  viewBody: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    paddingTop: 4,
  },
  section: {
    display: "flex",
    flexDirection: "column",
  },
  sectionLabel: {
    margin: 0,
    fontSize: 17,
    fontWeight: 510,
    color: "rgba(3,18,40,0.7)",
    padding: "8px 24px 16px",
  },
  petName: {
    margin: 0,
    fontSize: 19,
    fontWeight: 700,
    color: "rgba(3,18,40,0.7)",
    padding: "8px 24px 16px",
  },
  speciesCardWrap: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  speciesCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 18,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    width: "100%",
    boxSizing: "border-box",
  },
  speciesEmoji: {
    width: 32,
    height: 32,
    objectFit: "contain",
  },
  speciesCardText: {
    fontSize: 15,
    fontWeight: 510,
    color: "#4E5968",
    textAlign: "center" as const,
  },
  editBtnWrap: {
    display: "flex",
    justifyContent: "center",
    paddingTop: 4,
  },
  editPillBtn: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "2px 12px 2px 10px",
    minHeight: 32,
    minWidth: 52,
    borderRadius: 8,
    backgroundColor: "rgba(7,25,76,0.05)",
    border: "none",
    cursor: "pointer",
    outline: "none",
    WebkitTapHighlightColor: "transparent",
  },
  editPillText: {
    fontSize: 13,
    fontWeight: 590,
    color: "rgba(3,18,40,0.7)",
  },

  /* 편집 상태 */
  editBody: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    paddingTop: 4,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
  },
  textFieldWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: "16px 20px",
  },
  textField: {
    width: "100%",
    minHeight: 54,
    borderRadius: 14,
    border: "1px solid",
    padding: "14px 16px",
    fontSize: 17,
    fontWeight: 510,
    color: "rgba(0,12,30,0.8)",
    outline: "none",
    boxSizing: "border-box" as const,
  },
  hintText: {
    margin: 0,
    fontSize: 13,
    color: "rgba(0,19,43,0.58)",
    lineHeight: "1.5",
    paddingLeft: 4,
  },
  speciesRow: {
    display: "flex",
    gap: 8,
    padding: "0 20px",
  },
  speciesChip: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 4,
    padding: 18,
    borderRadius: 16,
    border: "none",
    cursor: "pointer",
    outline: "none",
    WebkitTapHighlightColor: "transparent",
    transition: "background-color 0.15s",
  },
  speciesChipText: {
    fontSize: 15,
    lineHeight: "1.252",
    textAlign: "center" as const,
    whiteSpace: "nowrap" as const,
  },
  breedWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: "8px 20px 0",
  },
  bottom: {
    padding: "0 20px 20px",
    flexShrink: 0,
    display: "flex",
    gap: 8,
    backgroundColor: "white",
  },
  btnClose: {
    flex: 1,
    minHeight: 56,
    borderRadius: 16,
    border: "none",
    backgroundColor: "rgba(7,25,76,0.05)",
    fontSize: 17,
    fontWeight: 590,
    color: "rgba(3,18,40,0.7)",
    cursor: "pointer",
    outline: "none",
    WebkitTapHighlightColor: "transparent",
  },
  btnConfirm: {
    flex: 1,
    minHeight: 56,
    borderRadius: 16,
    border: "none",
    backgroundColor: "#508FE1",
    fontSize: 17,
    fontWeight: 590,
    color: "white",
    cursor: "pointer",
    outline: "none",
    WebkitTapHighlightColor: "transparent",
    transition: "opacity 0.15s",
  },
};
