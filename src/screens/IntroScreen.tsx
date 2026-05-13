import { Button } from "@toss/tds-mobile";

// TODO: 로컬 에셋으로 교체 필요 (Figma 에셋 URL은 7일 후 만료)
const IMG_PHONE_1 =
  "https://www.figma.com/api/mcp/asset/7f043298-c6ca-4a1e-9173-c74a2203c758";
const IMG_PHONE_2 =
  "https://www.figma.com/api/mcp/asset/ccf456d2-3e91-4619-a29e-8430b6b83f91";
const IMG_PHONE_3 =
  "https://www.figma.com/api/mcp/asset/c3741828-7c9c-489d-8e8d-b4265e0e59e4";
const ICON_PET =
  "https://www.figma.com/api/mcp/asset/bb7951da-c85d-4cdb-bb8b-444101770b62"; // 발바닥
const ICON_CAMERA =
  "https://www.figma.com/api/mcp/asset/88c3938a-4bdf-4bfb-bb81-57f25d920d64"; // 카메라
const ICON_CALENDAR =
  "https://www.figma.com/api/mcp/asset/44e94cb2-9638-4281-947e-00bc6737a4af"; // 달력

interface Props {
  onLogin: () => void;
}

const steps = [
  {
    icon: ICON_PET,
    title: "반려동물 정보를 등록해요",
    desc: "이름과 종을 등록해주세요.",
    hasBar: true,
  },
  {
    icon: ICON_CAMERA,
    title: "오늘의 가장 귀여운 순간을 기록해요",
    desc: "매일 가장 귀여운 순간을 차곡차곡 모아요.",
    hasBar: true,
  },
  {
    icon: ICON_CALENDAR,
    title: "매일의 귀여움을 배경화면으로 만들어요",
    desc: "주·달별로 귀여운 배경화면을 만들 수 있어요.",
    hasBar: false,
  },
];

export default function IntroScreen({ onLogin }: Props) {
  return (
    <div style={s.container}>
      <div style={s.scroll}>
        {/* 타이틀 영역 */}
        <div style={s.titleSection}>
          <h1 style={s.title}>
            매일 하나, 반려동물의
            <br />
            가장 귀여운 순간 모으기
          </h1>
          <p style={s.subtitle}>귀여운 순간을 모아 배경화면으로 만들어봐요.</p>
        </div>

        {/* 폰 목업 카드 */}
        <div style={s.phonesWrapper}>
          <div style={s.phonesCard}>
            {[IMG_PHONE_1, IMG_PHONE_2, IMG_PHONE_3].map((src, i) => (
              <img key={i} src={src} alt="" style={s.phoneImg} />
            ))}
          </div>
        </div>

        {/* 스테퍼 */}
        <div style={s.stepper}>
          {steps.map((step, i) => (
            <div key={i} style={s.stepRow}>
              <div style={s.stepLeft}>
                <div style={s.iconBox}>
                  <img src={step.icon} alt="" style={s.stepIcon} />
                </div>
                {step.hasBar && <div style={s.stepBar} />}
              </div>
              <div style={s.stepContent}>
                <p style={s.stepTitle}>{step.title}</p>
                <p style={s.stepDesc}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 CTA */}
      <div style={s.bottomCta}>
        <div style={s.gradient} />
        <div style={s.buttonWrapper}>
          <Button style={{ width: "100%" }} onClick={onLogin}>
            자세히보기
          </Button>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "white",
    overflow: "hidden",
  },
  scroll: {
    flex: 1,
    overflowY: "auto",
  },
  titleSection: {
    padding: "24px 24px 0",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    lineHeight: "37px",
    color: "#191F28",
    letterSpacing: -0.3,
  },
  subtitle: {
    margin: 0,
    marginTop: 4,
    fontSize: 15,
    fontWeight: 400,
    lineHeight: "25.5px",
    color: "rgba(3,18,40,0.7)",
  },
  phonesWrapper: {
    padding: "24px 20px 0",
  },
  phonesCard: {
    backgroundColor: "rgba(49,130,246,0.16)",
    borderRadius: 20,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    padding: "24px 16px",
  },
  phoneImg: {
    width: 71,
    height: 154,
    objectFit: "cover",
    borderRadius: 8,
    border: "3px solid rgba(255,255,255,0.68)",
  },
  stepper: {
    padding: "24px 24px 0",
  },
  stepRow: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
  },
  stepLeft: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  iconBox: {
    width: 24,
    height: 24,
    flexShrink: 0,
  },
  stepIcon: {
    width: 24,
    height: 24,
  },
  stepBar: {
    width: 2,
    flex: 1,
    minHeight: 16,
    backgroundColor: "#E5E8EB",
    borderRadius: 41,
  },
  stepContent: {
    paddingBottom: 16,
    paddingTop: 2,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  stepTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 700,
    lineHeight: "25.5px",
    color: "rgba(0,12,30,0.8)",
  },
  stepDesc: {
    margin: 0,
    fontSize: 15,
    fontWeight: 400,
    lineHeight: "22px",
    color: "rgba(0,19,43,0.58)",
  },
  bottomCta: {
    position: "relative",
    flexShrink: 0,
    backgroundColor: "white",
  },
  gradient: {
    height: 36,
    background: "linear-gradient(to bottom, rgba(255,255,255,0), white)",
    marginTop: -36,
    pointerEvents: "none",
  },
  buttonWrapper: {
    padding: "0 20px 20px",
  },
};
