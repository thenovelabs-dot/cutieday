import { NavigationProvider, useNavigation } from "./lib/navigation";
import IntroScreen from "./screens/IntroScreen";

function Router() {
  const { current, navigate } = useNavigation();

  switch (current.screen) {
    case "Intro":
      return (
        <IntroScreen
          onLogin={() => {
            // TODO: 토스 로그인 연동 후 신규/기존 유저 분기
            navigate("OnboardingSpecies");
          }}
        />
      );

    // TODO: 아래 화면들은 구현 후 추가
    case "OnboardingSpecies":
    case "OnboardingName":
    case "PhotoUpload":
    case "HomeCamera":
    case "HomeAlbum":
    case "ImageAdjust":
    case "PetEdit":
    case "HomeMonth":
    case "HomeWeek":
    case "Wallpaper_Week":
    case "Wallpaper_Month":
    case "Downloading":
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
