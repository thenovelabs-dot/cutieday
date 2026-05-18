import { NavigationProvider, useNavigation } from "./lib/navigation";
import { loginWithToss } from "./lib/tossLogin";
import { setUserKey } from "./lib/auth";
import { supabase } from "./lib/supabase";
import IntroScreen from "./screens/IntroScreen";
import OnboardingSpeciesScreen from "./screens/OnboardingSpeciesScreen";
import OnboardingNameScreen from "./screens/OnboardingNameScreen";
import PhotoUploadScreen from "./screens/PhotoUploadScreen";
import HomeCameraScreen from "./screens/HomeCameraScreen";
import HomeAlbumScreen from "./screens/HomeAlbumScreen";
import ImageAdjustScreen from "./screens/ImageAdjustScreen";
import PetEditScreen from "./screens/PetEditScreen";
import HomeMonthScreen from "./screens/HomeMonthScreen";
import WallpaperScreen from "./screens/WallpaperScreen";
import DownloadingScreen from "./screens/DownloadingScreen";

function Router() {
  const { current, navigate, goBack } = useNavigation();

  switch (current.screen) {
    case "Intro":
      return (
        <IntroScreen
          onLogin={async () => {
            try {
              const { userKey, isNewUser } = await loginWithToss();
              navigate(isNewUser ? "OnboardingSpecies" : "HomeMonth");
            } catch (e) {
              window.alert("로그인 오류: " + (e instanceof Error ? e.message : String(e)));
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
          onNext={() => navigate("HomeMonth")}
          onBack={() => goBack()}
        />
      );

    case "PhotoUpload": {
      const uploadDate = (current.params as { date?: string })?.date;
      return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <HomeMonthScreen />
          <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
            <PhotoUploadScreen
              onCamera={() => navigate("HomeCamera", { date: uploadDate })}
              onAlbum={() => navigate("HomeAlbum", { date: uploadDate })}
              onClose={() => goBack()}
            />
          </div>
        </div>
      );
    }

    case "HomeCamera": {
      const camDate = (current.params as { date?: string })?.date;
      return (
        <HomeCameraScreen
          onCapture={(uri) => navigate("ImageAdjust", { uri, date: camDate })}
          onBack={() => goBack()}
        />
      );
    }

    case "HomeAlbum": {
      const albumDate = (current.params as { date?: string })?.date;
      return (
        <HomeAlbumScreen
          onSelect={(uri) => navigate("ImageAdjust", { uri, date: albumDate })}
          onBack={() => goBack()}
        />
      );
    }

    case "ImageAdjust": {
      const { uri, date } = current.params as { uri: string; date?: string };
      return (
        <ImageAdjustScreen
          uri={uri}
          date={date}
          onBack={() => goBack()}
          onDone={() => navigate("HomeMonth")}
        />
      );
    }

    case "PetEdit":
      return <PetEditScreen onBack={() => goBack()} />;

    case "HomeMonth":
      return <HomeMonthScreen />;

    case "Wallpaper":
      return <WallpaperScreen />;

    case "Downloading":
      return <DownloadingScreen />;
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
