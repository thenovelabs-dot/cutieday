import { useState, useRef } from "react";
import { Button } from "@toss/tds-mobile";
import { supabase } from "../lib/supabase";
import { getUserKey } from "../lib/auth";

interface Props {
  uri: string;
  onBack: () => void;
  onDone: () => void;
}

const CROP_SIZE = 335;
const OUTPUT_SIZE = 1080;

async function buildBlob(
  img: HTMLImageElement,
  imgScale: number,
  offsetX: number,
  offsetY: number
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext("2d")!;

  const factor = OUTPUT_SIZE / CROP_SIZE;
  const drawX = ((CROP_SIZE - img.naturalWidth * imgScale) / 2 + offsetX) * factor;
  const drawY = ((CROP_SIZE - img.naturalHeight * imgScale) / 2 + offsetY) * factor;
  const drawW = img.naturalWidth * imgScale * factor;
  const drawH = img.naturalHeight * imgScale * factor;

  ctx.drawImage(img, drawX, drawY, drawW, drawH);

  return new Promise((resolve, reject) => {
    let quality = 0.85;
    const attempt = () => {
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("blob conversion failed"));
          if (blob.size <= 500 * 1024 || quality <= 0.3) {
            resolve(blob);
          } else {
            quality = Math.max(quality - 0.1, 0.3);
            attempt();
          }
        },
        "image/jpeg",
        quality
      );
    };
    attempt();
  });
}

export default function ImageAdjustScreen({ uri, onBack, onDone }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const imgScaleRef = useRef(1);
  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);

  const [imgLoaded, setImgLoaded] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [uploading, setUploading] = useState(false);

  const onImgLoad = () => {
    const img = imgRef.current!;
    imgScaleRef.current = Math.max(
      CROP_SIZE / img.naturalWidth,
      CROP_SIZE / img.naturalHeight
    );
    setImgLoaded(true);
  };

  const getPointer = (e: React.MouseEvent | React.TouchEvent) => {
    if ("touches" in e) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
  };

  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const p = getPointer(e);
    dragRef.current = { startX: p.x, startY: p.y, ox: offset.x, oy: offset.y };
  };

  const onDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragRef.current) return;
    const p = getPointer(e);
    setOffset({
      x: dragRef.current.ox + (p.x - dragRef.current.startX),
      y: dragRef.current.oy + (p.y - dragRef.current.startY),
    });
  };

  const onDragEnd = () => { dragRef.current = null; };

  const handleRegister = async () => {
    const img = imgRef.current;
    if (!img || !imgLoaded) return;
    const userKey = getUserKey();
    if (!userKey) return;

    setUploading(true);
    try {
      const blob = await buildBlob(img, imgScaleRef.current, offset.x, offset.y);

      const { data: pet } = await supabase
        .from("pets")
        .select("id")
        .eq("user_id", userKey)
        .limit(1)
        .single();
      if (!pet) throw new Error("no pet found");

      const today = new Date().toISOString().split("T")[0];
      const path = `${userKey}/${pet.id}/${today}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("pet-photos")
        .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("pet-photos")
        .getPublicUrl(path);

      const { error: dbError } = await supabase.from("daily_photos").upsert(
        { pet_id: pet.id, date: today, image_url: urlData.publicUrl },
        { onConflict: "pet_id,date" }
      );
      if (dbError) throw dbError;

      // 이번 주(월~오늘) 업로드 수 → HomeMonthScreen 팝업에서 읽음
      const monday = new Date();
      monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
      const { data: weekPhotos } = await supabase
        .from("daily_photos")
        .select("date")
        .eq("pet_id", pet.id)
        .gte("date", monday.toISOString().split("T")[0])
        .lte("date", today);
      const streakDay = weekPhotos?.length ?? 1;
      sessionStorage.setItem("pendingSuccessDay", streakDay.toString());

      onDone();
    } catch (e) {
      console.error(e);
      window.alert("업로드 오류: " + (e instanceof Error ? e.message : String(e)));
      setUploading(false);
    }
  };

  const imgScale = imgScaleRef.current;
  const scaledW = imgRef.current ? imgRef.current.naturalWidth * imgScale : 0;
  const scaledH = imgRef.current ? imgRef.current.naturalHeight * imgScale : 0;

  return (
    <div style={s.container}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>
          돌아가기
        </button>
        <span style={s.headerTitle}>사진 조정</span>
        <div style={{ width: 72 }} />
      </div>

      <div style={s.cropArea}>
        <div
          style={s.cropBox}
          onMouseDown={onDragStart}
          onMouseMove={onDragMove}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
          onTouchStart={onDragStart}
          onTouchMove={onDragMove}
          onTouchEnd={onDragEnd}
        >
          <img
            ref={imgRef}
            src={uri}
            alt=""
            onLoad={onImgLoad}
            draggable={false}
            style={{
              position: "absolute",
              width: imgLoaded ? scaledW : "auto",
              height: imgLoaded ? scaledH : "auto",
              top: "50%",
              left: "50%",
              transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        </div>
        <p style={s.hint}>이미지를 드래그해서 위치를 조정할 수 있어요</p>
      </div>

      <div style={s.bottom}>
        <Button
          style={{ width: "100%" }}
          disabled={!imgLoaded || uploading}
          loading={uploading}
          onClick={handleRegister}
        >
          등록하기
        </Button>
      </div>
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
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid #F2F4F6",
    flexShrink: 0,
  },
  backBtn: {
    background: "none",
    border: "none",
    padding: 0,
    fontSize: 15,
    color: "#4E5968",
    cursor: "pointer",
    width: 72,
    textAlign: "left",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#191F28",
  },
  cropArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 20,
    overflow: "hidden",
  },
  cropBox: {
    width: CROP_SIZE,
    height: CROP_SIZE,
    overflow: "hidden",
    position: "relative",
    borderRadius: 12,
    backgroundColor: "#F2F4F6",
    cursor: "grab",
    flexShrink: 0,
  },
  hint: {
    margin: 0,
    fontSize: 13,
    color: "rgba(0,19,43,0.38)",
    lineHeight: "19px",
  },
  bottom: {
    padding: "12px 20px 20px",
    flexShrink: 0,
  },
};
