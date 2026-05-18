 오늘도 귀여웠어

## 서비스 개요
앱인토스(토스 미니앱 플랫폼) 출시 예정인 반려동물 사진 앨범 서비스.
하루 한 장 사진 업로드 → 달력(월별/주별)으로 보기 → 프레임 합성 후 배경화면 다운로드.
MAU 목표: 1만명

## 기술 스택
- 앱인토스 React Native (@apps-in-toss/framework)
- TDS (Toss Design System) — 비게임 미니앱 필수, 항상 import해서 사용
- Supabase Pro — DB, Storage, (Auth는 사용 안 함, 토스 로그인 사용)
- react-native-view-shot — 배경화면 이미지 캡처 (서버 합성 없이 클라이언트에서 처리)
- expo-image-manipulator — 업로드 전 이미지 압축

## 앱인토스 필수 규칙
- 모든 화면 최상단에 TDS Navigation 컴포넌트 필수
- 화면 가로 375px 기준
- 다크모드 미지원 — 라이트모드 기준으로만 개발
- primaryColor: #3182F6 (토스 블루)

## 인증
- 로그인: 토스 로그인 SDK 사용 (자사 로그인, 카카오 등 다른 소셜 로그인 사용 불가)
- 토스에서 발급한 고유 사용자 ID를 Supabase users 테이블의 PK로 사용
- Supabase Auth는 사용하지 않음

## DB 스키마 (Supabase)
- users: id (토스 로그인 발급 ID), created_at
- pets: id, user_id, name, species(강아지|고양이|기타), breed, created_at
- daily_photos: id, pet_id, date(YYYY-MM-DD), image_url, created_at

## 이미지 최적화 (중요)
- 업로드 전 이미지 압축 필수 (최대 500KB/장)
- expo-image-manipulator로 리사이즈 + 품질 압축 후 Supabase Storage에 저장
- 배경화면 생성: 서버 합성 없이 클라이언트에서 처리
  → react-native-view-shot으로 캘린더 뷰 캡처 → 기기에 저장
  → Supabase는 원본 사진 저장/조회만 담당

## 폴더 구조
src/
  screens/       # 각 화면 컴포넌트
  components/    # 공통 컴포넌트
  lib/
    supabase.ts  # Supabase 클라이언트 (A담당, 이후 수정 금지)
    tossLogin.ts # 토스 로그인 SDK 래퍼 (A담당)
  hooks/         # 커스텀 훅
  types/         # TypeScript 타입 정의
  styles/
    tokens.ts    # 커스텀 색상 토큰 (TDS에 없는 것만)

## 화면 목록 및 담당
### A담당 (유저 플로우)
1. IntroScreen — 서비스 소개, 토스 로그인 버튼
2. OnboardingSpeciesScreen — 반려동물 종 선택 (강아지/고양이/기타)
3. OnboardingNameScreen — 이름 입력, 유효성 검사 (10자 이내, 특수문자 불가)
4. PhotoUploadScreen — 업로드 방식 선택 바텀시트 (사진 촬영 / 앨범에서 선택)
5. Home-Camera — 카메라 화면
6. Home-Album — 갤러리 화면 (이미지 1개만 선택 가능)
7. ImageAdjustScreen — 이미지 크롭/조정, Supabase Storage 업로드
8. PetEditScreen — 편집 전 기본 상태 (이름/종 텍스트 표시, 편집하기 버튼)
   PetEditScreen-Editing — 편집 상태 (이름 입력, 종 선택 칩, 완료/닫기 버튼)

### B담당 (콘텐츠 플로우)
6. HomeScreen — 단일 화면, 내부 `calendarType` 상태("Month" | "Week")로 월별/주별 전환
   - Month 상태: 월별 달력, 날짜별 사진 썸네일, 날짜 클릭 시 Day_Upload 변경
   - Week 상태: 주별 보기
   - 탭 전환은 화면 이동이 아닌 내부 상태 변경 (navigate 호출 없음)
   - 파일명: HomeMonthScreen.tsx (실질적으로 HomeScreen 역할)
7. Home-SuccessPopup — 업로드 성공 팝업 (4일차 / 7일차 2가지 상태)
8. WallpaperScreen — 단일 화면, 내부 `wallpaperType` 상태("Week" | "Month")로 주별/월별 전환
   - Week 상태: 주별 배경화면 미리보기, 날짜 선택 바텀시트(CalendarWeekPicker) 포함
   - Month 상태: 월별 배경화면 미리보기, 날짜 선택 바텀시트(CalendarMonthPicker) 포함
   - 탭 전환은 화면 이동이 아닌 내부 상태 변경 (navigate 호출 없음)
   - 파일명: WallpaperScreen.tsx
9. DownloadingScreen — 생성 중 / 완료 / 실패 3가지 상태 관리, 하단 배너 광고 항상 노출
    // react-native-view-shot으로 캡처 후 기기 갤러리에 저장

## 화면 전환 플로우

### 인트로 / 온보딩 (A담당)
```
IntroScreen (서비스 소개)
  → [자세히보기 버튼] → 토스 로그인 실행
  → 로그인 성공 + 신규유저 → OnboardingSpeciesScreen
  → 로그인 성공 + 기존유저 → HomeScreen

OnboardingSpeciesScreen (종 선택)
  → 강아지/고양이 선택 시: [다음] 활성화 → OnboardingNameScreen
  → 그 외 선택 시: 품종 직접 입력 텍스트필드 추가 노출 → 입력 후 [다음] → OnboardingNameScreen

OnboardingNameScreen (이름 입력)
  → 이름 입력 중: 실시간 유효성 검사
    - 정상: 파란 테두리 입력필드
    - 10자 초과: 빨간 테두리 + 에러 메시지 ("10자 이내로 입력해주세요")
    - 특수문자: 빨간 테두리 + 에러 메시지
  → 유효한 이름 입력 완료 → [시작하기] 활성화 → HomeScreen
```

### 홈 (B담당)
```
HomeScreen (calendarType = "Month" — 사진 미업로드 상태)
  → 상단 [주별] 탭 → calendarType = "Week" 로 내부 상태 전환 (화면 이동 아님)
  → 하단 [업로드하기] 버튼 탭 → PhotoUploadScreen (바텀시트)
  → 하단 [{몽치} 배경화면 만들기] 배너 탭 → WallpaperScreen

HomeScreen (calendarType = "Month" — 사진 업로드 완료 상태)
  // 오늘 날짜 셀에 사진 썸네일 표시, 하단에 오늘의 사진 + [변경하기] 버튼 노출
  → 상단 [주별] 탭 → calendarType = "Week" 로 내부 상태 전환
  → 하단 [변경하기] 버튼 → PhotoUploadScreen (사진 교체)

HomeScreen (calendarType = "Week")
  → 상단 [월별] 탭 → calendarType = "Month" 로 내부 상태 전환

PhotoUploadScreen (업로드 방식 선택 바텀시트)
  → [사진 촬영하기] → Home-Camera (카메라 실행)
  → [앨범에서 선택하기] → Home-Album (갤러리)
    // 이미지 1개만 선택 가능 (Frame 5534 주석)

Home-Camera (카메라 화면)
  → 촬영 완료 → ImageAdjustScreen

Home-Album (앨범/갤러리 화면)
  → 사진 선택 → ImageAdjustScreen
  // 이미지 1개만 선택 가능

ImageAdjustScreen (이미지 크롭/조정)
  // 정사각형 박스 안에 어떻게 이미지가 들지 조정 가능하도록 (Frame 5535 주석)
  → [완료] → 이미지 압축(500KB 이하) → Supabase Storage 업로드
    → 업로드 성공:
      - 1~6일차: Home-SuccessPopup (4일차 팝업)
        // 1~6일차 : "확인했어요" = 닫기 (Frame 5536 주석)
        - 타이틀: "4일차", 서브: "기록 성공!"
        - 요일 스트릭 표시 (월화수목금토일, 달성한 날 파란 발바닥 아이콘)
        - 메시지: "3일만 더 업로드하면 주간 배경화면을 만들 수 있어요!"
        - [확인했어요] → 팝업 닫기 → HomeScreen
      - 7일차: Home-SuccessPopup (7일차 팝업)
        // 7일차 : "닫기" = 닫기, "만들러가기" : 배경화면 만들기 페이지로 이동 (Frame 5537 주석)
        - 타이틀: "7일차", 서브: "기록 성공!"
        - 요일 스트릭 표시 (7일 모두 파란 발바닥 아이콘)
        - 메시지: "일주일 업로드를 성공했어요! 주간 배경화면을 바로 만들어보세요."
        - [닫기] → 팝업 닫기 → HomeScreen
        - [만들러가기] → WallpaperScreen
```

### 사진 업로드 (A담당)
```
PhotoUploadScreen (업로드 방식 선택 바텀시트)
  → [사진 촬영하기] → 카메라 실행 → 촬영 → ImageAdjustScreen
  → [앨범에서 선택하기] → 갤러리 열림 → 사진 선택 → ImageAdjustScreen

ImageAdjustScreen (이미지 크롭/조정)
  → [돌아가기] → PhotoUploadScreen
  → [등록하기] → 이미지 압축(500KB 이하) → Supabase Storage 업로드
    → 업로드 성공:
      - 1~3일차: 특별 반응 없이 HomeScreen으로 복귀
      - 4일차: "4일차" 축하 팝업 노출 → [확인하러 가기] → HomeScreen
      - 7일차: "7일차" 축하 팝업 노출 → [닫기] or [만들어보기] → WallpaperScreen
```

### 배경화면 다운로드 (B담당)
```
WallpaperScreen (wallpaperType = "Week" — 주별 배경화면 미리보기)
  → 최초 진입 시: 버튼 텍스트 "다운받기" (광고 미적용 상태)
  → 날짜 드롭다운 탭 → 바텀시트 (CalendarWeekPicker: 년/월/주차)
    - [확인] 버튼: 날짜 선택 전까지 비활성화 (회색)
    - [확인] 버튼: 날짜 선택 완료 시 활성화 (파란색)
    - [닫기] → 바텀시트 닫힘
  → 상단 [월별] 탭 → wallpaperType = "Month" 로 내부 상태 전환 (navigate 호출 없음)
  → [광고보고 다운받기] 버튼 탭 → RewardAds

WallpaperScreen (wallpaperType = "Month" — 월별 배경화면 미리보기)
  → 날짜 드롭다운 탭 → 바텀시트 (CalendarMonthPicker: 년/월)
    - [확인] 활성/비활성 동일 규칙 적용
    - [닫기] → 바텀시트 닫힘
  → 상단 [주별] 탭 → wallpaperType = "Week" 로 내부 상태 전환 (navigate 호출 없음)
  → [광고보고 다운받기] 버튼 탭 → RewardAds

RewardAds (리워드 광고)
  → 광고 시청 완료 → Download-ing (생성 중)
  → 광고 시청 실패/스킵 → WallpaperScreen (버튼 비활성 유지)

Download-ing (생성 중/완료/실패 화면)
  // 생성 중, 완료, 실패 모든 상태에서 하단에 배너 광고("봄맞이 특가 세일 · AD") 노출
  
  [생성 중 상태]
  - 타이틀: "배경화면을 생성하고 있어요"
  - 서브: "대부분 5초안에 완료돼요."
  - [저장하기] 버튼 비활성화 (회색)
  → 생성 성공 → Download-ing (완료 상태)
  → 생성 실패 → Download-ing (실패 상태)

  [완료 상태]
  - 타이틀: "배경화면 생성 완료!"
  - 서브: "저장 버튼을 누르면 바로 저장이 돼요."
  - [저장하기] 버튼 활성화 (파란색)
  → [저장하기] → 기기 갤러리에 저장

  [실패 상태]
  - 타이틀: "앗! 배경화면 생성에 실패했어요"
  - 서브: "일시적인 문제니 다시시도해주세요."
  - [다시 만들기] 버튼 → WallpaperScreen
```

### 반려동물 정보 편집 (A담당)
```
PetEditScreen (편집 전 기본 상태)
  → 현재 이름({몽치}), 종(강아지) 텍스트로 표시
  → [편집하기] 버튼 탭 → PetEditScreen-Editing

PetEditScreen-Editing (편집 상태)
  // 수정한거 없을때 "완료" = Disabled (Frame 5539)
  // TextField = Error이면 "완료" Disabled (Frame 5540)

  [이름 필드]
  - 기본: 흰 배경 입력필드, 힌트 "10자 이내로 입력해주세요."
  - 포커스/정상 입력: 파란 테두리
  - 10자 초과: 분홍 배경 + 빨간 테두리 + 에러 메시지 "10자 이내로 입력해주세요." (빨간색)
    → [완료] 버튼 Disabled 유지

  [종 선택 칩]
  - 강아지 / 고양이 / 그외 3개 칩
  - 선택된 칩: 진한 배경 하이라이트
  - "그외" 선택 시: 하단에 "반려동물 종" 텍스트필드 추가 노출
    - 힌트 텍스트: "해당 종이 많아지면, 업데이트 시 캐릭터가 반영될 수 있어요."

  [완료 버튼 활성화 조건]
  - 이름이 기존과 다르게 수정됨 AND 에러 없음
  - 종이 기존과 다르게 변경됨
  - 위 조건 중 하나라도 충족 + 에러 없으면 [완료] 활성화 (파란색)
  → [완료] 탭 → 저장 → 이전 화면으로 복귀
  → [닫기] → 저장 없이 이전 화면으로 복귀
```

## 수익화
- 배경화면 다운로드 시 리워드 광고 필수 시청 후 다운 가능
- 광고 시청 완료해야만 다운로드 버튼 활성화
- 앱인토스 인앱 광고 SDK 사용 (별도 연동 필요)

## 역할 분담 규칙
- App.tsx (라우터), supabase.ts, tossLogin.ts 는 A가 초기 생성 후 관리
- B는 완성된 화면 컴포넌트만 작성, 라우터 파일 직접 수정 금지
- 컴포넌트 네이밍: A는 User/Pet/Upload 접두사, B는 Calendar/Wallpaper/Home 접두사
- Git 브랜치: A → feature/user-flow, B → feature/content-flow, 공통 → main

## 컴포넌트별 특이사항
- 달력 컴포넌트: 시스템 큰글씨(접근성 폰트 크기) 대응 안 함 — 고정 폰트 크기로 구현

## 개발 시 주의사항
- TDS에 없는 컴포넌트만 StyleSheet.create()로 직접 스타일 작성
- Supabase RLS 필수 설정 — 본인 데이터만 조회되도록
- .env 파일은 절대 GitHub에 커밋 금지 (.gitignore에 포함)
- 환경변수: SUPABASE_URL, SUPABASE_ANON_KEY, TOSS_LOGIN_CLIENT_ID
