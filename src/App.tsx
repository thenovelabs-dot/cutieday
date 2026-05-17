import { NavigationProvider, useNavigation } from "./lib/navigation";
import { loginWithToss } from "./lib/tossLogin";
import IntroScreen from "./screens/IntroScreen";
import HomeMonthScreen from "./screens/HomeMonthScreen";
import WallpaperScreen from "./screens/WallpaperScreen";
import DownloadingScreen from "./screens/DownloadingScreen";

function Router() {
  const { current, navigate } = useNavigation();

  switch (current.screen) {
    case "Intro":
      return (
        <IntroScreen
          onLogin={async () => {
            const { isNewUser } = await loginWithToss();
            navigate(isNewUser ? "OnboardingSpecies" : "HomeMonth");
          }}
        />
      );

    // TODO: 임시 연결 (미리보기용) — 확인 후 되돌릴 것
    case "HomeMonth":
      return <HomeMonthScreen />;

    case "Wallpaper":
      return <WallpaperScreen />;

    case "Downloading":
      return <DownloadingScreen />;

    // TODO: 아래 화면들은 구현 후 추가
    case "OnboardingSpecies":
    case "OnboardingName":
    case "PhotoUpload":
    case "HomeCamera":
    case "HomeAlbum":
    case "ImageAdjust":
    case "PetEdit":
      return <div style={{ padding: 24 }}>🚧 {current.screen} 구현 예정</div>;
  }
}

function App() {
  return (
    <NavigationProvider>
      <Router />
    </NavigationProvider>
  );
}

export default App;
