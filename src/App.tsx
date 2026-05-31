import { useState, useEffect } from "react";
import { NavigationProvider, useNavigation } from "./lib/navigation";
import { loginWithToss } from "./lib/tossLogin";
import { setUserKey, getUserKey, clearUserKey } from "./lib/auth";
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
  const { current, navigate, reset, goBack } = useNavigation();
  const [autoLoginDone, setAutoLoginDone] = useState(false);

  useEffect(() => {
    const storedKey = getUserKey();
    if (!storedKey) {
      setAutoLoginDone(true);
      return;
    }
    reset("HomeMonth");
    setAutoLoginDone(true);
    // 로그인 끊기 콜백으로 DB에서 삭제된 경우 감지
    supabase.rpc("check_user_exists", { user_id: storedKey }).then(({ data }) => {
      if (data === false) {
        clearUserKey();
        reset("Intro");
      }
    });
  }, []);

  if (!autoLoginDone) {
    return <div style={{ width: "100%", height: "100%", backgroundColor: "white" }} />;
  }

  switch (current.screen) {
    case "Intro":
      return (
        <IntroScreen
          onLogin={async () => {
            try {
              const { userKey, isNewUser } = await loginWithToss();
              isNewUser ? navigate("OnboardingSpecies") : reset("HomeMonth");
            } catch (e) {
              const msg = e instanceof Error ? e.message : String(e);
              if (msg.includes("완료할 수 없") || msg.includes("cancel") || msg.includes("Cancel")) return;
              window.alert("로그인 오류: " + msg);
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
          onNext={() => reset("HomeMonth")}
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
          onDone={() => reset("HomeMonth")}
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
