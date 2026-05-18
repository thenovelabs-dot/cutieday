import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { graniteEvent, closeView } from "@apps-in-toss/web-bridge";

export type Screen =
  // A담당
  | "Intro"
  | "OnboardingSpecies"
  | "OnboardingName"
  | "PhotoUpload"
  | "HomeCamera"
  | "HomeAlbum"
  | "ImageAdjust"
  | "PetEdit"
  // B담당
  | "HomeMonth"
  | "Wallpaper"
  | "Downloading";

export type ScreenParams = {
  Intro: undefined;
  OnboardingSpecies: undefined;
  OnboardingName: { species: string; breed?: string };
  PhotoUpload: undefined;
  HomeCamera: undefined;
  HomeAlbum: undefined;
  ImageAdjust: { uri: string };
  PetEdit: undefined;
  HomeMonth: undefined;
  Wallpaper: { initialType?: "Week" | "Month" };
  Downloading: {
    frameStyle: string;
    bgColor: string;
    wallpaperType: "week" | "month";
    year: number;
    month: number;
    week?: number;
    photoMap: Record<string, string>;
    petName: string;
    fromAd: boolean;
  };
};

interface NavEntry {
  screen: Screen;
  params: ScreenParams[Screen];
}

interface NavContextValue {
  current: NavEntry;
  navigate: <S extends Screen>(
    screen: S,
    params?: ScreenParams[S]
  ) => void;
  reset: <S extends Screen>(screen: S, params?: ScreenParams[S]) => void;
  goBack: () => void;
  canGoBack: () => boolean;
}

const NavContext = createContext<NavContextValue | null>(null);

const EXIT_ROOT_SCREENS: Screen[] = ["HomeMonth", "Intro"];

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [stack, setStack] = useState<NavEntry[]>([
    { screen: "Intro", params: undefined },
  ]);
  const [showExitModal, setShowExitModal] = useState(false);

  const stackRef = useRef(stack);
  stackRef.current = stack;

  const navigate = useCallback(
    <S extends Screen>(screen: S, params?: ScreenParams[S]) => {
      window.history.pushState({ screen, params }, "");
      setStack((prev) => [...prev, { screen, params: params as ScreenParams[Screen] }]);
    },
    []
  );

  const reset = useCallback(
    <S extends Screen>(screen: S, params?: ScreenParams[S]) => {
      setStack([{ screen, params: params as ScreenParams[Screen] }]);
    },
    []
  );

  const goBack = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const canGoBack = useCallback(() => stackRef.current.length > 1, []);

  useEffect(() => {
    const handlePopState = () => {
      setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const removeListener = graniteEvent.addEventListener("backEvent", {
      onEvent: () => {
        const currentStack = stackRef.current;
        if (currentStack.length > 1) {
          setStack((prev) => prev.slice(0, -1));
        } else if (EXIT_ROOT_SCREENS.includes(currentStack[0].screen)) {
          setShowExitModal(true);
        }
      },
    });
    return removeListener;
  }, []);

  const current = stack[stack.length - 1];

  return (
    <NavContext.Provider value={{ current, navigate, reset, goBack, canGoBack }}>
      {children}
      {showExitModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "flex-end",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          onClick={() => setShowExitModal(false)}
        >
          <div
            style={{
              width: "100%",
              backgroundColor: "#fff",
              borderRadius: "20px 20px 0 0",
              padding: "28px 20px 40px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ fontSize: 18, fontWeight: 700, color: "#191F28", margin: "0 0 8px", textAlign: "center" }}>
              앱을 종료할까요?
            </p>
            <p style={{ fontSize: 14, color: "#6B7684", margin: "0 0 24px", textAlign: "center" }}>
              오늘도 귀여웠어를 종료해요.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                style={{
                  flex: 1,
                  height: 52,
                  borderRadius: 12,
                  border: "none",
                  backgroundColor: "#F2F4F6",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#191F28",
                  cursor: "pointer",
                }}
                onClick={() => setShowExitModal(false)}
              >
                취소
              </button>
              <button
                style={{
                  flex: 1,
                  height: 52,
                  borderRadius: 12,
                  border: "none",
                  backgroundColor: "#508FE1",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#fff",
                  cursor: "pointer",
                }}
                onClick={() => closeView()}
              >
                종료하기
              </button>
            </div>
          </div>
        </div>
      )}
    </NavContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNavigation must be used inside NavigationProvider");
  return ctx;
}
