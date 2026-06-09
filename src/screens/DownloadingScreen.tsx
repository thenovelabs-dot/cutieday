import React, { useState, useEffect, useRef } from "react";
import { useNavigation } from "../lib/navigation";
import AppNav from "../components/AppNav";
import HomeBannerAd from "../components/HomeBannerAd";
import WallpaperFrame from "../components/WallpaperFrame";
import type { WallpaperFrameStyle } from "../components/WallpaperFrame";
import {
  WEEK_CELLS, MONTH_GRID,
  bgLayers, overlayLayers,
  POSTCARD_MONTH_CELLS, POLAROID_MONTH_X, POLAROID_MONTH_Y, POSTCARD_MON_ROT,
} from "../components/WallpaperFrame";
import type { WeekKey } from "../components/WallpaperFrame";

const WEEK_DAY_KEYS: WeekKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

async function loadImageBitmap(url: string): Promise<ImageBitmap | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    return await createImageBitmap(blob);
  } catch {
    return null;
  }
}

async function loadImgEl(src: string): Promise<HTMLImageElement> {
  const res = await fetch(src);
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(blobUrl); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(blobUrl); reject(new Error(`img load fail: ${src}`)); };
    img.src = blobUrl;
  });
}

function drawCoverRotated(
  ctx: CanvasRenderingContext2D,
  img: ImageBitmap | HTMLImageElement,
  x: number, y: number, w: number, h: number,
  borderRadius: number,
  rotDeg: number,
) {
  const cx = x + w / 2, cy = y + h / 2;
  ctx.save();
  ctx.translate(cx, cy);
  if (rotDeg) ctx.rotate(rotDeg * Math.PI / 180);
  ctx.beginPath();
  if (borderRadius > 0) {
    ctx.roundRect(-w / 2, -h / 2, w, h, borderRadius);
  } else {
    ctx.rect(-w / 2, -h / 2, w, h);
  }
  ctx.clip();
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale, dh = img.height * scale;
  ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
  ctx.restore();
}

async function drawSubtitleCanvas(
  ctx: CanvasRenderingContext2D,
  frameStyle: WallpaperFrameStyle,
  isWeek: boolean,
  year: number,
  month: number,
  week: number | undefined,
  petName: string,
) {
  if (["Apple", "Note", "Spark", "Star"].includes(frameStyle)) return;

  let iconImg: HTMLImageElement | null = null;
  try { iconImg = await loadImgEl("/assets/wallpaper/animal-icon.svg"); } catch { /* ok */ }

  ctx.textBaseline = "top";
  ctx.fillStyle = "#ffffff";

  if (frameStyle === "Default") {
    const textY = isWeek ? 314 : 327;
    const text = isWeek
      ? `${year}년 ${month}월 ${week}주차 ${petName}. 오늘도 귀여웠어`
      : `${year}년 ${month}월 ${petName}. 오늘도 귀여웠어`;
    ctx.font = "400 17px 'Dongle', sans-serif";
    ctx.fillText(text, 40, textY);
    if (iconImg) ctx.drawImage(iconImg, 40 + ctx.measureText(text).width + 5, textY, 15, 15);
    return;
  }

  if (frameStyle === "Polaroid") {
    ctx.font = "400 17px 'Dongle', sans-serif";
    if (isWeek) {
      ctx.fillText(`${year}년 ${month}월 ${week}주차 ${petName}. `, 66, 293);
      const botText = "오늘도 귀여웠어";
      ctx.fillText(botText, 66, 664);
      if (iconImg) ctx.drawImage(iconImg, 66 + ctx.measureText(botText).width + 5, 664, 15, 15);
    } else {
      const text = `${year}년 ${month}월 ${petName}. 오늘도 귀여웠어`;
      ctx.fillText(text, 40, 324);
      if (iconImg) ctx.drawImage(iconImg, 40 + ctx.measureText(text).width + 5, 324, 15, 15);
    }
    return;
  }

  if (frameStyle === "Postcard") {
    ctx.font = "400 11px 'Dongle', sans-serif";
    const lineH = 11 * 0.96;
    if (isWeek) {
      if (iconImg) ctx.drawImage(iconImg, 204, 599, 18, 18);
      ctx.fillText(`${year}년 ${month}월`, 204, 622);
      ctx.fillText(`${week}주차`, 204, 622 + lineH);
      ctx.fillText(petName, 204, 622 + lineH * 2);
      ctx.fillText(`오늘도 귀여웠어`, 204, 622 + lineH * 3);
    } else {
      if (iconImg) ctx.drawImage(iconImg, 253, 598, 18, 18);
      const tx = 253 + 18 + 6;
      ctx.fillText(`${year}년 ${month}월`, tx, 598);
      ctx.fillText(`${petName} 오늘도 귀여웠어`, tx, 598 + lineH);
    }
  }
}

async function renderWallpaperToBlob(
  photoMap: Record<string, string>,
  bgColor: string,
  frameStyle: WallpaperFrameStyle,
  type: "week" | "month",
  year: number,
  month: number,
  week?: number,
  petName?: string,
): Promise<Blob> {
  const W = 375, H = 812, PX = 3;
  const canvas = document.createElement("canvas");
  canvas.width = W * PX;
  canvas.height = H * PX;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(PX, PX);

  const isWeek = type === "week";
  const effectiveBg = (frameStyle === "Note" && bgColor === "#508FE1") ? "#ffffff" : bgColor;
  const daysInMonth = new Date(year, month, 0).getDate();
  const cellBr = frameStyle === "Apple" ? 13 : (frameStyle === "Postcard" || frameStyle === "Polaroid") ? 0 : 8;

  // 1. 배경 채우기
  ctx.fillStyle = effectiveBg;
  ctx.fillRect(0, 0, W, H);

  // 2. 배경 SVG 레이어 (프레임 꾸밈요소)
  for (const l of bgLayers(frameStyle, isWeek, effectiveBg, daysInMonth)) {
    try {
      const img = await loadImgEl(l.src);
      ctx.drawImage(img, l.x, l.y, l.w, l.h);
    } catch { /* 에셋 누락 시 무시 */ }
  }

  // 3. 포토 셀 그리기
  if (isWeek) {
    await Promise.all(WEEK_DAY_KEYS.map(async (key) => {
      const url = photoMap[key];
      if (!url) return;
      const img = await loadImageBitmap(url);
      if (!img) return;
      const c = WEEK_CELLS[frameStyle][key];
      const rotDeg = (frameStyle === "Postcard" && key === "Mon") ? POSTCARD_MON_ROT : 0;
      drawCoverRotated(ctx, img, c.x, c.y, c.w, c.h, cellBr, rotDeg);
    }));
  } else if (frameStyle === "Postcard") {
    await Promise.all(
      POSTCARD_MONTH_CELLS.slice(0, daysInMonth).map(async ([x, y, w, h, rot], i) => {
        const url = photoMap[String(i + 1)];
        if (!url) return;
        const img = await loadImageBitmap(url);
        if (!img) return;
        drawCoverRotated(ctx, img, x, y, w, h, 0, rot);
      })
    );
  } else if (frameStyle === "Polaroid") {
    await Promise.all(
      Array.from({ length: daysInMonth }, async (_, i) => {
        const col = i % 7, row = Math.floor(i / 7);
        const url = photoMap[String(i + 1)];
        if (!url) return;
        const img = await loadImageBitmap(url);
        if (!img) return;
        drawCoverRotated(ctx, img, POLAROID_MONTH_X[col], POLAROID_MONTH_Y[row], 37, 43, 0, 0);
      })
    );
  } else {
    const g = MONTH_GRID[frameStyle];
    const cw = g.w / 7, ch = g.h / 5;
    await Promise.all(
      Array.from({ length: daysInMonth }, async (_, i) => {
        const url = photoMap[String(i + 1)];
        if (!url) return;
        const img = await loadImageBitmap(url);
        if (!img) return;
        drawCoverRotated(ctx, img, g.x + (i % 7) * cw, g.y + Math.floor(i / 7) * ch, cw, ch, cellBr, 0);
      })
    );
  }

  // 4. 오버레이 SVG 레이어 (포토 셀 위에 얹히는 꾸밈요소)
  for (const l of overlayLayers(frameStyle, isWeek)) {
    try {
      const img = await loadImgEl(l.src);
      ctx.drawImage(img, l.x, l.y, l.w, l.h);
    } catch { /* 에셋 누락 시 무시 */ }
  }

  // 5. 텍스트/자막 오버레이
  await document.fonts.ready;
  await drawSubtitleCanvas(ctx, frameStyle, isWeek, year, month, week, petName || "");

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => { blob ? resolve(blob) : reject(new Error("blob failed")); },
      "image/jpeg", 0.95,
    );
  });
}

type DownloadStatus = "generating" | "complete" | "failed";

const SCALE = 140 / 375;
const PREVIEW_W = 140;
const PREVIEW_H = Math.round(812 * SCALE);

const STATUS_CONTENT: Record<DownloadStatus, { title: string; subtitle: string }> = {
  generating: {
    title: "배경화면을 생성하고 있어요",
    subtitle: "대부분 5초안에 완료돼요.",
  },
  complete: {
    title: "배경화면 생성 완료!",
    subtitle: "저장 버튼을 누르면 바로 저장이 돼요.",
  },
  failed: {
    title: "앗! 배경화면 생성에 실패했어요",
    subtitle: "일시적인 문제니 다시시도해주세요.",
  },
};

function SpinnerIcon() {
  return (
    <div style={{
      width: 40, height: 40,
      border: "3.5px solid #E5E8EB",
      borderTopColor: "#3182F6",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }} />
  );
}

function CheckIcon() {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: "50%",
      backgroundColor: "#00BD79",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M5 11.5L9 15.5L17 7.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function XIcon() {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: "50%",
      backgroundColor: "#EF4452",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M6 6L16 16M16 6L6 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}


export default function DownloadingScreen() {
  const { current, navigate } = useNavigation();
  const params = (current.params ?? {}) as {
    frameStyle?: WallpaperFrameStyle;
    bgColor?: string;
    wallpaperType?: "week" | "month";
    year?: number;
    month?: number;
    week?: number;
    photoMap?: Record<string, string>;
    petName?: string;
  };

  const {
    frameStyle = "Default",
    bgColor = "#508FE1",
    wallpaperType = "week",
    year = new Date().getFullYear(),
    month = new Date().getMonth() + 1,
    week,
    photoMap = {},
    petName = "",
  } = params;

  const [status, setStatus] = useState<DownloadStatus>("generating");
  const [attempt, setAttempt] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const blobRef = useRef<Blob | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerSaveToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setShowToast(true);
    toastTimerRef.current = setTimeout(() => setShowToast(false), 2000);
  };

  useEffect(() => {
    setStatus("generating");
    blobRef.current = null;

    const run = async () => {
      try {
        const blob = await renderWallpaperToBlob(photoMap, bgColor, frameStyle, wallpaperType, year, month, week, petName);
        blobRef.current = blob;
        setStatus("complete");
      } catch (e) {
        console.error("wallpaper capture failed:", e);
        setStatus("failed");
      }
    };

    run().catch(() => setStatus("failed"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const handleBtn = async () => {
    if (status === "complete" && blobRef.current) {
      const fileName = `오늘도귀여웠어_${year}-${String(month).padStart(2, "0")}.jpg`;
      const file = new File([blobRef.current], fileName, { type: "image/jpeg" });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
          triggerSaveToast();
          return;
        } catch (e) {
          if ((e as Error).name === "AbortError") return;
          // AbortError가 아닌 오류는 fallback으로 진행
        }
      }
      // Web Share API 미지원 또는 실패 시 anchor fallback
      const url = URL.createObjectURL(blobRef.current);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 100);
      triggerSaveToast();
    } else if (status === "failed") {
      setAttempt(n => n + 1);
    }
  };

  const { title, subtitle } = STATUS_CONTENT[status];

  const btnBg =
    status === "complete" ? "#508FE1" :
    status === "failed" ? "#F2F4F6" :
    "#D1D6DB";
  const btnColor = status === "failed" ? "#191F28" : "#fff";

  return (
    <>
      <div style={{ width: 375, height: 812, backgroundColor: "#fff", overflow: "hidden", display: "flex", flexDirection: "column", userSelect: "none", position: "relative" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>
        <AppNav showTitle onBack={() => navigate("HomeMonth")} />

        {/* 컨텐츠 — 네비와 CTA 사이 수직 중앙 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", gap: 0 }}>

          {/* 상태 아이콘 */}
          <div style={{ marginBottom: 16, flexShrink: 0 }}>
            {status === "generating" && <SpinnerIcon />}
            {status === "complete" && <CheckIcon />}
            {status === "failed" && <XIcon />}
          </div>

          {/* 타이틀 / 서브타이틀 */}
          <div style={{ textAlign: "center", paddingLeft: 24, paddingRight: 24, marginBottom: 34, flexShrink: 0 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#191F28", lineHeight: 1.4, marginBottom: 4 }}>
              {title}
            </div>
            <div style={{ fontSize: 15, fontWeight: 400, color: "#6B7684", lineHeight: 1.4 }}>
              {subtitle}
            </div>
          </div>

          {/* 배경화면 미리보기 */}
          <div style={{ width: PREVIEW_W, height: PREVIEW_H, overflow: "hidden", flexShrink: 0, marginBottom: 24, borderRadius: 18 }}>
            <div style={{ width: 375, height: 812, transform: `scale(${SCALE})`, transformOrigin: "top left" }}>
              <WallpaperFrame
                type={wallpaperType}
                frameStyle={frameStyle}
                bgColor={bgColor}
                year={year}
                month={month}
                week={week}
                photoMap={photoMap}
                petName={petName}
                previewContainer={false}
              />
            </div>
          </div>

        </div>

        {/* 하단 CTA — 항상 하단 고정 */}
        <HomeBannerAd adGroupId={(import.meta.env.VITE_ADS_BANNER_DOWNLOADING_GROUP_ID as string | undefined) ?? "ait-ad-test-banner-id"} />
        <div style={{ flexShrink: 0 }}>
          <div style={{ height: 36, background: "linear-gradient(to bottom, rgba(255,255,255,0), #fff)" }} />
          <div style={{ backgroundColor: "#fff", paddingLeft: 20, paddingRight: 20, paddingBottom: 24 }}>
            <button
              disabled={status === "generating"}
              onClick={handleBtn}
              style={{
                width: "100%", height: 56, borderRadius: 12, border: "none",
                backgroundColor: btnBg, color: btnColor,
                fontSize: 17, fontWeight: 590,
                cursor: status === "generating" ? "default" : "pointer",
                transition: "background-color 0.3s",
                outline: "none",
              }}
            >
              {status === "failed" ? "다시 만들기" : "저장하기"}
            </button>
          </div>
        </div>

        {showToast && (
          <div style={{
            position: "absolute",
            bottom: 104,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(25, 31, 40, 0.88)",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 100,
            fontSize: 14,
            fontWeight: 500,
            whiteSpace: "nowrap",
            zIndex: 100,
            animation: "toastIn 0.2s ease-out",
          }}>
            갤러리에 저장되었어요
          </div>
        )}
      </div>
    </>
  );
}
