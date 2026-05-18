import { NavigationProvider, useNavigation } from "./lib/navigation";
import { loginWithToss } from "./lib/tossLogin";
import { setUserKey } from "./lib/auth";
import IntroScreen from "./screens/IntroScreen";
import OnboardingSpeciesScreen from "./screens/OnboardingSpeciesScreen";
import OnboardingNameScreen from "./screens/OnboardingNameScreen";
import PhotoUploadScreen from "./screens/PhotoUploadScreen";
import HomeCameraScreen from "./screens/HomeCameraScreen";
import HomeAlbumScreen from "./screens/HomeAlbumScreen";
import ImageAdjustScreen from "./screens/ImageAdjustScreen";
import PetEditScreen from "./screens/PetEditScreen";

function Router() {
  const { current, navigate, goBack } = useNavigation();

  switch (current.screen) {
    case "Intro":
      return (
        <IntroScreen
          onLogin={async () => {
            try {
              const { userKey, isNewUser } = await loginWithToss();
              setUserKey(userKey);
              navigate(isNewUser ? "OnboardingSpecies" : "HomeMonth");
            } catch {
              if (import.meta.env.DEV) {
                setUserKey("dev-user");
                navigate("OnboardingSpecies");
              }
            }
          }}
        />
      );

    case "OnboardingSpecies":
      return (
        <OnboardingSpeciesScreen
          onNext={(species, breed) =>
            navigate("OnboardingName", { species, breed })
          }
          onBack={() => goBack()}
        />
      );

    case "OnboardingName":
      return (
        <OnboardingNameScreen
          species={current.params.species}
          breed={current.params.breed}
          onNext={() => navigate("PhotoUpload")} // TODO: merge 전 HomeMonth로 복구
          onBack={() => goBack()}
        />
      );

    case "PhotoUpload":
      return (
        <PhotoUploadScreen
          onCamera={() => navigate("HomeCamera")}
          onAlbum={() => navigate("HomeAlbum")}
          onClose={() => goBack()}
        />
      );

    case "HomeCamera":
      return (
        <HomeCameraScreen
          onCapture={(uri) => navigate("ImageAdjust", { uri })}
          onBack={() => goBack()}
        />
      );

    case "HomeAlbum":
      return (
        <HomeAlbumScreen
          onSelect={(uri) => navigate("ImageAdjust", { uri })}
          onBack={() => goBack()}
        />
      );

    case "ImageAdjust":
      return (
        <ImageAdjustScreen
          uri={(current.params as { uri: string }).uri}
          onBack={() => goBack()}
          onDone={(streakDay, petName) => {
            if (streakDay === 4 || streakDay === 7)
              navigate("SuccessPopup", { day: streakDay, petName });
            else
              navigate("HomeMonth");
          }}
        />
      );

    case "PetEdit":
      return <PetEditScreen onBack={() => goBack()} />;

    // TODO: B담당 화면 — merge 후 import 교체
    case "SuccessPopup":
    case "HomeMonth":
    case "HomeWeek":
    case "Wallpaper_Week":
    case "Wallpaper_Month":
    case "Downloading":
      return <div style={{ padding: 24 }}>🚧 {current.screen} 구현 예정 (B담당)</div>;
  }
}

function App() {
  return (
    <NavigationProvider>
      <div style={{ height: "100dvh", width: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <Router />
      </div>
    </NavigationProvider>
  );
}

export default App;
