import React, { useState, useEffect } from "react";
import { useNavigation } from "../lib/navigation";
import WallpaperFrame from "../components/WallpaperFrame";
import type { WallpaperFrameStyle } from "../components/WallpaperFrame";

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

function AdBanner() {
  // TODO: 배너 광고 연결 시 실제 광고 컴포넌트로 교체
  return (
    <div style={{
      marginLeft: 20, marginRight: 20,
      height: 69,
      backgroundColor: "#F2F4F6",
      borderRadius: 12,
    }} />
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
    fromAd?: boolean;
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

  useEffect(() => {
    setStatus("generating");
    // TODO: 배포 시 react-native-view-shot 캡처 로직으로 교체
    const t = setTimeout(() => setStatus("complete"), 2000);
    return () => clearTimeout(t);
  }, [attempt]);

  const { title, subtitle } = STATUS_CONTENT[status];

  const handleBtn = () => {
    if (status === "complete") {
      // TODO: react-native-view-shot으로 캡처 → 기기 갤러리에 저장
      alert("갤러리에 저장되었습니다.");
    } else if (status === "failed") {
      setAttempt((n) => n + 1);
    }
  };

  const btnBg =
    status === "complete" ? "#508FE1" :
    status === "failed" ? "#F2F4F6" :
    "#D1D6DB";
  const btnColor = status === "failed" ? "#191F28" : "#fff";

  return (
    <div style={{ width: 375, height: 812, backgroundColor: "#fff", overflow: "hidden", display: "flex", flexDirection: "column", userSelect: "none" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* 컨텐츠 — 상단(나중엔 네비)과 CTA 사이 수직 중앙 */}
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
            />
          </div>
        </div>

        {/* 광고 배너 */}
        <div style={{ width: "100%", flexShrink: 0 }}>
          <AdBanner />
        </div>
      </div>

      {/* 하단 CTA — 항상 하단 고정 */}
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
    </div>
  );
}
