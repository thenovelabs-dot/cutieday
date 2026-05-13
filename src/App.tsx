import { NavigationProvider, useNavigation } from "./lib/navigation";
import { loginWithToss } from "./lib/tossLogin";
import IntroScreen from "./screens/IntroScreen";

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
