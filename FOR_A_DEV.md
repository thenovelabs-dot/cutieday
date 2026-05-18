# A담당 작업 전 필독 사항

> B담당(콘텐츠 플로우)이 구현한 내용 중 A담당과 연동이 필요한 부분을 정리한 문서입니다.
> 작업 시작 전 반드시 읽어주세요.

---

## 1. 네비게이션 스택 구조

`src/lib/navigation.tsx`의 `Screen` 타입에 B담당 화면이 이미 등록되어 있습니다.
라우터(`App.tsx`)는 switch/case 방식으로 **한 번에 하나의 화면만 렌더링**합니다.
→ 화면 전환 시 이전 화면은 **언마운트(완전히 사라짐)**됩니다.

---

## 2. 업로드 성공 팝업 (Home-SuccessPopup) 연동

### 팝업이 뭔가요?
사용자가 "업로드하기"로 사진 업로드 완료 시 HomeMonthScreen에서 자동으로 뜨는 축하 팝업입니다.
1일차 ~ 7일차 모두 팝업이 표시됩니다.

### A담당이 해야 할 일
ImageAdjustScreen에서 Supabase 업로드 성공 후 아래 코드를 추가해주세요.

```typescript
// 1. 이번 주(월~일) 중 업로드된 날 수를 Supabase에서 조회해서 streakDay 계산
//    예: 이번 주에 오늘 포함 3일 업로드했으면 streakDay = 3
const streakDay = /* 계산 로직 */;  // 1 이상 7 이하 정수

// 2. sessionStorage에 저장
sessionStorage.setItem("pendingSuccessDay", streakDay.toString());

// 3. HomeMonth로 이동 (goBack() 또는 navigate)
navigate("HomeMonth");
```

### 왜 sessionStorage인가요?
HomeMonthScreen은 `navigate("HomeMonth")` 시 새로 마운트됩니다.
마운트 시점에 `pendingSuccessDay` 값을 읽어 팝업을 띄우고 즉시 키를 삭제합니다.
별도 전역 상태나 라우터 파라미터 수정 없이 연동 가능합니다.

### streakDay 계산 방법 (예시)
```typescript
// 이번 주 월요일 ~ 오늘까지 날짜 범위로 Supabase 조회
const today = new Date();
const monday = new Date(today);
monday.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // 월요일 기준

const { data } = await supabase
  .from("daily_photos")
  .select("date")
  .eq("pet_id", petId)
  .gte("date", formatDate(monday))
  .lte("date", formatDate(today));

const streakDay = data?.length ?? 1; // 오늘 업로드 포함한 수
```

---

## 3. 사진 업로드 후 HomeMonthScreen photoMap 갱신

업로드 완료 후 `navigate("HomeMonth")`로 돌아오면 HomeMonthScreen이 새로 마운트되면서
Supabase에서 photoMap을 다시 불러옵니다. **별도 처리 불필요합니다.**

---

## 4. WallpaperScreen 라우터 등록 방법

### WallpaperScreen은 단일 화면입니다
`WallpaperScreen_Week`와 `WallpaperScreen_Month`는 **별도 화면이 아닙니다.**
HomeMonthScreen과 동일하게, 하나의 화면(`WallpaperScreen.tsx`) 안에서
내부 `wallpaperType` 상태(`"Week" | "Month"`)로 주별/월별을 전환합니다.

### A담당이 해야 할 일
`navigation.tsx`의 `Screen` 타입과 `App.tsx`의 라우터에 **`"Wallpaper"` 하나만** 등록해주세요.

```typescript
// navigation.tsx — Screen 타입에 추가
type Screen =
  | "HomeMonth"
  | "Wallpaper"   // ← 이것만. "Wallpaper_Week" / "Wallpaper_Month" 는 없음
  | /* 기타 A담당 화면들 */;

// App.tsx — switch/case에 추가
case "Wallpaper":
  return <WallpaperScreen />;
```

### navigate 호출 방법
```typescript
// HomeMonthScreen의 [배경화면 만들기] 배너, 또는
// Home-SuccessPopup의 [만들러가기] 버튼에서:
navigate("Wallpaper");

// WallpaperScreen 내부에서 주별/월별 전환은 navigate 호출 없이
// 내부 state만 바꿉니다 — A담당이 신경 쓸 필요 없습니다.
```

---

## 5. B담당이 이미 구현한 화면 목록

| 파일 | 설명 |
|------|------|
| `src/screens/HomeMonthScreen.tsx` | HomeScreen (월별/주별 통합, 내부 상태로 전환) |
| `src/screens/WallpaperScreen.tsx` | WallpaperScreen (주별/월별 통합, 내부 상태로 전환) |
| `src/screens/DownloadingScreen.tsx` | DownloadingScreen (생성중/완료/실패 3가지 상태) |
| `src/components/Calendar.tsx` | 월별/주별 캘린더 |
| `src/components/CalendarDateM.tsx` | 월별 날짜 셀 (selected 상태 포함) |
| `src/components/CalendarDateL.tsx` | 주별 날짜 셀 (selected 상태 포함) |
| `src/components/CalendarMonthPicker.tsx` | 월별 년/월 선택 바텀시트 |
| `src/components/CalendarWeekPicker.tsx` | 주별 년/월/주 선택 바텀시트 |
| `src/components/HomeUploadCard.tsx` | Day_Upload 카드 (None/Upload/Future 상태) |
| `src/components/HomeSuccessPopup.tsx` | 업로드 성공 팝업 (1~7일차) |
| `src/components/WallpaperFrame.tsx` | 배경화면 프레임 컴포넌트 (week/month 공용) |
| `src/components/SegmentText.tsx` | 월별/주별 탭 전환 컴포넌트 |
| `src/components/AnimalProfile.tsx` | 반려동물 프로필 아이콘 |

---

## 6. 주의사항

- `HomeWeek` 화면은 별도로 존재하지 않습니다. `HomeMonth`(= HomeMonthScreen.tsx)가 내부 `calendarType` 상태로 월별/주별을 전환합니다. `navigate("HomeWeek")`를 호출하지 마세요.
- `Wallpaper_Week` / `Wallpaper_Month` 화면도 존재하지 않습니다. `navigate("Wallpaper")`만 사용하세요.
- `HomeMonthScreen.tsx`, `WallpaperScreen.tsx`를 직접 수정하지 마세요. 연동이 필요한 경우 이 문서에 추가하거나 B담당에게 문의하세요.
- Brand color: `#508FE1` (피그마 Color:Brand / --primary 토큰)

---

---

## 7. DownloadingScreen 연동 (A담당 필수)

### 화면 구조
`DownloadingScreen.tsx`는 3가지 상태를 관리합니다.

| 상태 | 설명 | 버튼 |
|------|------|------|
| `generating` | 생성 중 (스피너) | 저장하기 비활성(회색) |
| `complete` | 생성 완료 (초록 체크) | 저장하기 활성(파란색) |
| `failed` | 생성 실패 (빨간 X) | 다시 만들기 → 재시도 |

현재 코드에서 `setTimeout(() => setStatus("complete"), 2000)`은 **임시 코드**입니다.
배포 전 반드시 아래 실제 로직으로 교체해야 합니다.

### A담당이 해야 할 일 — react-native-view-shot 연동

`DownloadingScreen.tsx`의 `useEffect` 내부와 `handleBtn` 두 곳을 수정해야 합니다.

```typescript
// 1. useEffect — 화면 진입 시 자동으로 캡처 시도
useEffect(() => {
  setStatus("generating");
  (async () => {
    try {
      // WallpaperFrame ref를 캡처
      const uri = await captureRef(wallpaperRef, { format: "png", quality: 1 });
      setCapturedUri(uri);
      setStatus("complete");
    } catch {
      setStatus("failed");
    }
  })();
}, [attempt]);

// 2. handleBtn — 저장하기 클릭 시
const handleBtn = () => {
  if (status === "complete" && capturedUri) {
    // CameraRoll / MediaLibrary 권한 요청 후 저장
    await MediaLibrary.saveToLibraryAsync(capturedUri);
  } else if (status === "failed") {
    setAttempt((n) => n + 1); // 재시도 (이미 구현됨)
  }
};
```

### WallpaperFrame ref 전달 방법
DownloadingScreen에서 WallpaperFrame에 `ref`를 붙여야 캡처가 가능합니다.
WallpaperFrame 컴포넌트에 `forwardRef`를 추가하거나,
wrapper div에 ref를 달아서 사용하세요.

### navigate 호출 방법 (WallpaperScreen → DownloadingScreen)
WallpaperScreen에서 이미 아래 파라미터를 전달하고 있습니다.

```typescript
navigate("Downloading", {
  frameStyle,   // WallpaperFrameStyle
  bgColor,      // string (hex)
  wallpaperType, // "week" | "month"
  year, month, week,
  photoMap,     // Record<string, string> — 해당 기간 사진 URL 맵
  petName,
  fromAd,       // boolean — Default 스타일이면 false, 나머지는 true
})
```

DownloadingScreen은 이 파라미터로 WallpaperFrame을 미리보기로 렌더링하고 있습니다.
캡처 시 동일한 WallpaperFrame을 사용하면 됩니다.

---

## 8. 광고 SDK 연동 (A담당 필수)

### 리워드 광고 (WallpaperScreen)
`WallpaperScreen.tsx`의 CTA 버튼 onClick에 광고 분기가 **아직 없습니다.**
현재는 style=Default 포함 모든 스타일에서 바로 DownloadingScreen으로 이동합니다.

배포 전 아래처럼 분기를 추가해주세요.

```typescript
// WallpaperScreen.tsx — CTA 버튼 onClick
onClick={() => {
  if (!isCtaEnabled) return;
  if (selectedStyle !== "Default") {
    // TODO: 앱인토스 리워드 광고 SDK 호출
    showRewardAd({
      onComplete: () => navigate("Downloading", { ...params }),
      onFail: () => { /* 버튼 유지, 아무것도 안 함 */ },
    });
  } else {
    navigate("Downloading", { ...params });
  }
}}
```

### 배너 광고 (HomeMonthScreen, DownloadingScreen)
두 화면에 회색 placeholder div가 있습니다. 광고 SDK 연동 시 교체하세요.

```typescript
// HomeMonthScreen.tsx — s.adBanner 스타일 div
// DownloadingScreen.tsx — AdBanner 컴포넌트 내부

// 두 곳 모두 동일하게 교체:
<AdBannerSDKComponent /> // 앱인토스 배너 광고 컴포넌트
```

크기: **width 100% (양쪽 20px padding), height 69px**

---

## 9. 배포 전 반드시 되돌려야 할 임시 설정

| 파일 | 현재 (임시) | 배포 시 변경값 |
|------|------------|--------------|
| `src/lib/navigation.tsx` line 71 | `screen: "HomeMonth"` | `screen: "Intro"` |
| `src/screens/DownloadingScreen.tsx` useEffect | `setTimeout → setStatus("complete")` | react-native-view-shot 실제 로직으로 교체 |

---

## 10. 업데이트 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-16 | 최초 작성 — 팝업 연동 방식(sessionStorage) 정의 |
| 2026-05-16 | WallpaperScreen 단일 화면 구조 안내 추가 |
| 2026-05-18 | DownloadingScreen 구현 완료 — react-native-view-shot 연동 방법 추가 |
| 2026-05-18 | 광고 SDK 연동 항목 추가 (리워드 광고 분기, 배너 광고 placeholder 위치) |
| 2026-05-18 | 배포 전 임시 설정 되돌리기 항목 추가 |
