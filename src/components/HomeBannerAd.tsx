import { useEffect, useRef, useState } from "react";
import { TossAds } from "@apps-in-toss/web-framework";

const DEFAULT_GROUP_ID = (import.meta.env.VITE_ADS_BANNER_GROUP_ID as string | undefined) ?? "ait-ad-test-banner-id";

interface Props {
  adGroupId?: string;
  flat?: boolean; // 홈 전용: 여백/radius 없이 height 72 고정
}

export default function HomeBannerAd({ adGroupId = DEFAULT_GROUP_ID, flat = false }: Props) {
  if (import.meta.env.DEV) {
    return (
      <div style={{ flexShrink: 0, width: "100%" }}>
        <div style={{
          width: "100%", height: flat ? 72 : 80, backgroundColor: "#F2F4F6",
          display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 13, color: "#8B95A1",
        }}>
          광고 배너 영역
        </div>
      </div>
    );
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const [initialized, setInitialized] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      if (!TossAds.initialize.isSupported()) {
        setVisible(false);
        return;
      }
      TossAds.initialize({
        callbacks: {
          onInitialized: () => setInitialized(true),
          onInitializationFailed: () => setVisible(false),
        },
      });
    } catch {
      setVisible(false);
    }
  }, []);

  useEffect(() => {
    if (!initialized || !containerRef.current) return;
    const attached = TossAds.attachBanner(adGroupId, containerRef.current, {
      theme: "light",
      tone: "grey",
      callbacks: {
        onNoFill: () => setVisible(false),
        onAdFailedToRender: () => setVisible(false),
      },
    });
    return () => attached.destroy();
  }, [initialized]);

  if (!visible) return null;

  if (flat) {
    return (
      <div style={{ flexShrink: 0, width: "100%", maxHeight: 72, overflow: "hidden", display: "flex", alignItems: "center" }}>
        <div ref={containerRef} style={{ width: "100%" }} />
      </div>
    );
  }

  return (
    <div style={{ flexShrink: 0, width: "100%" }}>
      <div ref={containerRef} style={{ width: "100%" }} />
    </div>
  );
}
