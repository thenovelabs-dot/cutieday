import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

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
  | "HomeWeek"
  | "Wallpaper_Week"
  | "Wallpaper_Month"
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
  HomeWeek: undefined;
  Wallpaper_Week: undefined;
  Wallpaper_Month: undefined;
  Downloading: { type: "week" | "month" };
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
  goBack: () => void;
  canGoBack: () => boolean;
}

const NavContext = createContext<NavContextValue | null>(null);

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [stack, setStack] = useState<NavEntry[]>([
    { screen: "Intro", params: undefined },
  ]);

  const stackRef = useRef(stack);
  stackRef.current = stack;

  const navigate = useCallback(
    <S extends Screen>(screen: S, params?: ScreenParams[S]) => {
      setStack((prev) => [...prev, { screen, params: params as ScreenParams[Screen] }]);
    },
    []
  );

  const goBack = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const canGoBack = useCallback(() => stackRef.current.length > 1, []);

  const current = stack[stack.length - 1];

  return (
    <NavContext.Provider value={{ current, navigate, goBack, canGoBack }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNavigation must be used inside NavigationProvider");
  return ctx;
}
