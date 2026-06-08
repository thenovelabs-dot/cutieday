import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
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
  Wallpaper: { initialType?: "Week" | "Month"; initialWeek?: { year: number; month: number; week: number }; initialMonth?: { year: number; month: number } };
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
  const skipPopStateRef = useRef(false);

  const navigate = useCallback(
    <S extends Screen>(screen: S, params?: ScreenParams[S]) => {
      window.history.pushState({ screen, params }, "");
      historyDepthRef.current += 1;
      setStack((prev) => [...prev, { screen, params: params as ScreenParams[Screen] }]);
    },
    []
  );

  const historyDepthRef = useRef(0);

  const reset = useCallback(
    <S extends Screen>(screen: S, params?: ScreenParams[S]) => {
      if (historyDepthRef.current > 0) {
        skipPopStateRef.current = true;
        window.history.go(-historyDepthRef.current);
        historyDepthRef.current = 0;
      }
      setStack([{ screen, params: params as ScreenParams[Screen] }]);
    },
    []
  );

  const goBack = useCallback(() => {
    const currentStack = stackRef.current;
    if (currentStack.length > 1) {
      skipPopStateRef.current = true;
      window.history.back();
      historyDepthRef.current = Math.max(0, historyDepthRef.current - 1);
      setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    }
  }, []);

  const canGoBack = useCallback(() => stackRef.current.length > 1, []);

  useEffect(() => {
    const handlePopState = () => {
      if (skipPopStateRef.current) {
        skipPopStateRef.current = false;
        return;
      }
      const currentStack = stackRef.current;
      if (currentStack.length > 1) {
        setStack((prev) => prev.slice(0, -1));
      } else if (EXIT_ROOT_SCREENS.includes(currentStack[0].screen)) {
        setShowExitModal(true);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const removeListener = graniteEvent.addEventListener("backEvent", {
      onEvent: () => {
        const currentStack = stackRef.current;
        if (currentStack.length > 1) {
          skipPopStateRef.current = true;
          window.history.back();
          historyDepthRef.current = Math.max(0, historyDepthRef.current - 1);
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
      {showExitModal && createPortal(
        <div style={exitModal.backdrop} onClick={() => setShowExitModal(false)}>
          <div style={exitModal.dialog} onClick={(e) => e.stopPropagation()}>
            <div style={exitModal.body}>
              <h3 style={exitModal.title}>오늘도 귀여웠어를 종료할까요?</h3>
            </div>
            <div style={exitModal.footer}>
              <button style={exitModal.cancelBtn} onClick={() => setShowExitModal(false)}>닫기</button>
              <button style={exitModal.confirmBtn} onClick={() => closeView()}>종료하기</button>
            </div>
          </div>
        </div>,
        document.getElementById("tds-mobile-portal-container") ?? document.body
      )}
    </NavContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNavigation must be used inside NavigationProvider");
  return ctx;
}

const exitModal: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 10000,
    backgroundColor: "rgba(0,0,0,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dialog: {
    backgroundColor: "#fff",
    borderRadius: 24,
    width: "calc(100vw - 64px)",
    maxWidth: 320,
    maxHeight: "calc(100vh - 160px)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    overflow: "auto",
    padding: "22px 22px 0",
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1.35,
    color: "#191F28",
  },
  footer: {
    display: "flex",
    flexWrap: "wrap-reverse",
    margin: "20px 16px 16px",
    gap: 8,
  },
  cancelBtn: {
    minWidth: "calc(50% - 4px)",
    flexGrow: 1,
    height: 52,
    borderRadius: 10,
    border: "none",
    backgroundColor: "#F2F4F6",
    color: "#191F28",
    fontSize: 17,
    fontWeight: 600,
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  },
  confirmBtn: {
    minWidth: "calc(50% - 4px)",
    flexGrow: 1,
    height: 52,
    borderRadius: 10,
    border: "none",
    backgroundColor: "#3182F6",
    color: "#fff",
    fontSize: 17,
    fontWeight: 600,
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  },
};
