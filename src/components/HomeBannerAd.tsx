import { useEffect, useRef, useState } from "react";
import { TossAds } from "@apps-in-toss/web-framework";

const DEFAULT_GROUP_ID = (import.meta.env.VITE_ADS_BANNER_GROUP_ID as string | undefined) ?? "ait-ad-test-banner-id";

interface Props {
  adGroupId?: string;
}

export default function HomeBannerAd({ adGroupId = DEFAULT_GROUP_ID }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [initialized, setInitialized] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!initialized || !containerRef.current) return;
    const attached = TossAds.attachBanner(adGroupId, containerRef.current, {
      theme: "light",
      tone: "grey",
      variant: "card",
      callbacks: {
        onNoFill: () => setVisible(false),
        onAdFailedToRender: () => setVisible(false),
      },
    });
    return () => attached.destroy();
  }, [initialized]);

  if (!visible) return null;

  return (
    <div style={{ flexShrink: 0, margin: "8px 16px" }}>
      <div ref={containerRef} style={{ height: 96 }} />
    </div>
  );
}
