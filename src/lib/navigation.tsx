import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { graniteEvent, closeView } from "@apps-in-toss/web-bridge";
import { ConfirmDialog } from "@toss/tds-mobile";

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
  const skipPopStateRef = useRef(false);

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
    const currentStack = stackRef.current;
    if (currentStack.length > 1) {
      skipPopStateRef.current = true;
      window.history.back();
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
      <ConfirmDialog
        open={showExitModal}
        title="오늘도 귀여웠어를 종료할까요?"
        onClose={() => setShowExitModal(false)}
        cancelButton={
          <ConfirmDialog.CancelButton onClick={() => setShowExitModal(false)}>
            닫기
          </ConfirmDialog.CancelButton>
        }
        confirmButton={
          <ConfirmDialog.ConfirmButton onClick={() => closeView()}>
            종료하기
          </ConfirmDialog.ConfirmButton>
        }
      />
    </NavContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNavigation must be used inside NavigationProvider");
  return ctx;
}
