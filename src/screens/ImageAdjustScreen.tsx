import { useState, useRef, useEffect } from "react";
import { Button } from "@toss/tds-mobile";
import { supabase } from "../lib/supabase";
import { getUserKey } from "../lib/auth";

interface Props {
  uri: string;
  date?: string;
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

export default function ImageAdjustScreen({ uri, date, onBack, onDone }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const cropBoxRef = useRef<HTMLDivElement>(null);
  const baseScaleRef = useRef(1);
  const imgScaleRef = useRef(1);
  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  const [imgLoaded, setImgLoaded] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [uploading, setUploading] = useState(false);

  const onImgLoad = () => {
    const img = imgRef.current!;
    const base = Math.max(CROP_SIZE / img.naturalWidth, CROP_SIZE / img.naturalHeight);
    baseScaleRef.current = base;
    imgScaleRef.current = base;
    setScale(base);
    setImgLoaded(true);
  };

  const getPinchDist = (touches: TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getPointer = (e: React.MouseEvent | React.TouchEvent) => {
    if ("touches" in e) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
  };

  const clampedOffset = (newX: number, newY: number, sc?: number) => {
    const img = imgRef.current;
    const s = sc ?? imgScaleRef.current;
    if (img) {
      const maxX = (img.naturalWidth * s - CROP_SIZE) / 2;
      const maxY = (img.naturalHeight * s - CROP_SIZE) / 2;
      newX = Math.max(-maxX, Math.min(maxX, newX));
      newY = Math.max(-maxY, Math.min(maxY, newY));
    }
    return { x: newX, y: newY };
  };

  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if ("touches" in e && e.touches.length === 2) {
      pinchRef.current = { dist: getPinchDist(e.touches as unknown as TouchList), scale: imgScaleRef.current };
      dragRef.current = null;
      return;
    }
    const p = getPointer(e);
    dragRef.current = { startX: p.x, startY: p.y, ox: offsetRef.current.x, oy: offsetRef.current.y };
  };

  const onDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragRef.current) return;
    const p = getPointer(e);
    const next = clampedOffset(
      dragRef.current.ox + (p.x - dragRef.current.startX),
      dragRef.current.oy + (p.y - dragRef.current.startY),
    );
    offsetRef.current = next;
    setOffset(next);
  };

  const onDragEnd = () => { dragRef.current = null; pinchRef.current = null; };

  useEffect(() => {
    const el = cropBoxRef.current;
    if (!el) return;
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 2 && pinchRef.current) {
        const newDist = getPinchDist(e.touches);
        const ratio = newDist / pinchRef.current.dist;
        const newScale = Math.max(baseScaleRef.current, pinchRef.current.scale * ratio);
        imgScaleRef.current = newScale;
        const next = clampedOffset(offsetRef.current.x, offsetRef.current.y, newScale);
        offsetRef.current = next;
        setScale(newScale);
        setOffset(next);
        return;
      }

      if (!dragRef.current) return;
      const p = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      const next = clampedOffset(
        dragRef.current.ox + (p.x - dragRef.current.startX),
        dragRef.current.oy + (p.y - dragRef.current.startY),
      );
      offsetRef.current = next;
      setOffset(next);
    };
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", handleTouchMove);
  }, []);

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

      const today = date ?? new Date().toISOString().split("T")[0];
      const path = `${userKey}/${pet.id}/${today}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("pet-photos")
        .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("pet-photos")
        .getPublicUrl(path);

      const imageUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: dbError } = await supabase.from("daily_photos").upsert(
        { pet_id: pet.id, date: today, image_url: imageUrl },
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

  const scaledW = imgRef.current ? imgRef.current.naturalWidth * scale : 0;
  const scaledH = imgRef.current ? imgRef.current.naturalHeight * scale : 0;

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
          ref={cropBoxRef}
          style={s.cropBox}
          onMouseDown={onDragStart}
          onMouseMove={onDragMove}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
          onTouchStart={onDragStart}
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
              width: imgLoaded ? scaledW : 0,
              height: imgLoaded ? scaledH : 0,
              left: imgLoaded ? (CROP_SIZE - scaledW) / 2 + offset.x : 0,
              top: imgLoaded ? (CROP_SIZE - scaledH) / 2 + offset.y : 0,
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        </div>
        <p style={s.hint}>드래그로 위치, 두 손가락으로 확대/축소할 수 있어요</p>
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
    touchAction: "none",
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
