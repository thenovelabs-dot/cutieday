import { useState, useEffect } from "react";
import { Button } from "@toss/tds-mobile";
import { supabase } from "../lib/supabase";
import { getUserKey } from "../lib/auth";

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

const SPECIES_OPTIONS: Species[] = ["강아지", "고양이", "기타"];
const SPECIES_LABELS: Record<Species, string> = { 강아지: "강아지", 고양이: "고양이", 기타: "그외" };
const SPECIAL_CHAR_REGEX = /[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s]/;

function validateName(v: string): string {
  if (v.length > 10) return "10자 이내로 입력해주세요.";
  if (SPECIAL_CHAR_REGEX.test(v)) return "특수문자는 사용할 수 없어요";
  return "";
}

export default function PetEditScreen({ onBack }: Props) {
  const [pet, setPet] = useState<PetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState("");
  const [species, setSpecies] = useState<Species>("강아지");
  const [breed, setBreed] = useState("");
  const [nameError, setNameError] = useState("");
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

  const nameChanged = name !== pet?.name;
  const speciesChanged =
    species !== pet?.species ||
    (species === "기타" && breed.trim() !== (pet?.breed ?? ""));
  const hasError = nameError !== "";
  const canSave = (nameChanged || speciesChanged) && !hasError;

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

  if (loading) {
    return (
      <div style={s.container}>
        <Header title="반려동물 정보" left={<button style={s.iconBtn} onClick={onBack}>←</button>} />
        <div style={s.center}>
          <p style={s.dimText}>불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div style={s.container}>
        <Header title="반려동물 정보" left={<button style={s.iconBtn} onClick={onBack}>←</button>} />
        <div style={s.center}>
          <p style={s.dimText}>반려동물 정보를 찾을 수 없어요.</p>
        </div>
      </div>
    );
  }

  if (!isEditing) {
    return (
      <div style={s.container}>
        <Header title="반려동물 정보" left={<button style={s.iconBtn} onClick={onBack}>←</button>} />
        <div style={s.viewContent}>
          <div style={s.infoCard}>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>이름</span>
              <span style={s.infoValue}>{pet.name}</span>
            </div>
            <div style={s.divider} />
            <div style={s.infoRow}>
              <span style={s.infoLabel}>종</span>
              <span style={s.infoValue}>
                {pet.species}{pet.breed ? ` (${pet.breed})` : ""}
              </span>
            </div>
          </div>
        </div>
        <div style={s.bottom}>
          <Button style={{ width: "100%" }} onClick={() => setIsEditing(true)}>
            편집하기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.container}>
      <Header
        title="반려동물 정보 편집"
        left={
          <button style={s.textBtn} onClick={handleCloseEdit}>
            닫기
          </button>
        }
      />
      <div style={s.editContent}>
        {/* 이름 필드 */}
        <div style={s.fieldGroup}>
          <label style={s.fieldLabel}>이름</label>
          <input
            style={{
              ...s.input,
              borderColor: hasError ? "#E53E3E" : name ? "#3182F6" : "#E5E8EB",
              backgroundColor: hasError ? "#FFF5F5" : "white",
            }}
            placeholder="10자 이내로 입력해주세요."
            value={name}
            onChange={handleNameChange}
            maxLength={20}
          />
          {hasError && <p style={s.errorText}>{nameError}</p>}
        </div>

        {/* 종 선택 칩 */}
        <div style={s.fieldGroup}>
          <label style={s.fieldLabel}>종</label>
          <div style={s.chipRow}>
            {SPECIES_OPTIONS.map((sp) => (
              <button
                key={sp}
                style={{
                  ...s.chip,
                  backgroundColor: species === sp ? "#EBF3FE" : "#F9FAFB",
                  border: `1.5px solid ${species === sp ? "#3182F6" : "transparent"}`,
                  color: species === sp ? "#3182F6" : "#4E5968",
                }}
                onClick={() => setSpecies(sp)}
              >
                {SPECIES_LABELS[sp]}
              </button>
            ))}
          </div>

          {species === "기타" && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              <input
                style={{ ...s.input, borderColor: "#3182F6" }}
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

      <div style={s.bottom}>
        <Button
          style={{ width: "100%" }}
          disabled={!canSave || saving}
          loading={saving}
          onClick={handleSave}
        >
          완료
        </Button>
      </div>
    </div>
  );
}

function Header({
  title,
  left,
}: {
  title: string;
  left: React.ReactNode;
}) {
  return (
    <div style={s.header}>
      <div style={{ width: 72 }}>{left}</div>
      <span style={s.headerTitle}>{title}</span>
      <div style={{ width: 72 }} />
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#F9FAFB",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    backgroundColor: "white",
    borderBottom: "1px solid #F2F4F6",
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#191F28",
  },
  iconBtn: {
    background: "none",
    border: "none",
    padding: 0,
    fontSize: 18,
    color: "#4E5968",
    cursor: "pointer",
  },
  textBtn: {
    background: "none",
    border: "none",
    padding: 0,
    fontSize: 15,
    color: "#4E5968",
    cursor: "pointer",
  },
  center: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dimText: {
    margin: 0,
    fontSize: 15,
    color: "#8B95A1",
  },
  viewContent: {
    flex: 1,
    overflowY: "auto",
    padding: 20,
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: 500,
    color: "#4E5968",
  },
  infoValue: {
    fontSize: 15,
    fontWeight: 500,
    color: "#191F28",
  },
  divider: {
    height: 1,
    backgroundColor: "#F2F4F6",
    margin: "0 20px",
  },
  editContent: {
    flex: 1,
    overflowY: "auto",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "#4E5968",
  },
  input: {
    width: "100%",
    height: 52,
    borderRadius: 10,
    border: "1.5px solid",
    padding: "0 16px",
    fontSize: 15,
    color: "#191F28",
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
  hintText: {
    margin: 0,
    fontSize: 13,
    color: "rgba(0,19,43,0.38)",
    lineHeight: "19px",
  },
  chipRow: {
    display: "flex",
    gap: 8,
  },
  chip: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 510,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  bottom: {
    padding: "12px 20px 20px",
    backgroundColor: "white",
    borderTop: "1px solid #F2F4F6",
    flexShrink: 0,
  },
};
