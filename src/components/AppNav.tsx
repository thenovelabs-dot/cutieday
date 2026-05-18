interface AppNavProps {
  onBack?: () => void;
  onClose?: () => void;
  showTitle?: boolean;
  showBell?: boolean;
}

const APP_LOGO_COLOR = "#3182F6";

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M15 18L9 12L15 6" stroke="#191F28" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2.5C7.1 2.5 4.75 4.85 4.75 7.75V11.5L3.5 13H16.5L15.25 11.5V7.75C15.25 4.85 12.9 2.5 10 2.5Z" stroke="#191F28" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 14.5C8.5 15.33 9.17 16 10 16C10.83 16 11.5 15.33 11.5 14.5" stroke="#191F28" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="4.5" r="1.5" fill="#191F28" />
      <circle cx="10" cy="10" r="1.5" fill="#191F28" />
      <circle cx="10" cy="15.5" r="1.5" fill="#191F28" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M5 5L15 15M15 5L5 15" stroke="#191F28" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function AppNav({ onBack, onClose, showTitle = true, showBell = false }: AppNavProps) {
  if (!import.meta.env.DEV) return null;

  return (
    <div style={s.nav}>
      {/* 왼쪽: 뒤로가기 + 타이틀 */}
      <div style={s.left}>
        {onBack ? (
          <button style={s.iconBtn} onClick={onBack} aria-label="뒤로가기">
            <BackIcon />
          </button>
        ) : (
          <div style={s.iconPlaceholder} />
        )}
        {showTitle && (
          <div style={s.titleArea}>
            <div style={{ ...s.logo, backgroundColor: APP_LOGO_COLOR }}>
              <span style={s.logoEmoji}>🐾</span>
            </div>
            <span style={s.titleText}>오늘도 귀여웠어</span>
          </div>
        )}
      </div>

      {/* 오른쪽: 벨(옵션) + 점3개+X */}
      <div style={s.right}>
        {showBell && (
          <div style={s.iconGroup}>
            <button style={s.iconBtn} aria-label="알림">
              <BellIcon />
            </button>
          </div>
        )}
        <div style={s.iconGroup}>
          <button style={s.iconBtn} aria-label="더보기">
            <DotsIcon />
          </button>
          <div style={s.divider} />
          <button style={s.iconBtn} onClick={onClose} aria-label="닫기">
            <CloseIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 44,
    paddingLeft: 4,
    paddingRight: 10,
    flexShrink: 0,
    backgroundColor: "white",
    width: "100%",
    boxSizing: "border-box",
  },
  left: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },
  iconBtn: {
    width: 44,
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    outline: "none",
    WebkitTapHighlightColor: "transparent",
    flexShrink: 0,
  },
  iconPlaceholder: {
    width: 44,
    height: 44,
    flexShrink: 0,
  },
  titleArea: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    height: 34,
    paddingRight: 10,
    borderRadius: 99,
    overflow: "hidden",
  },
  logo: {
    width: 18,
    height: 18,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoEmoji: {
    fontSize: 10,
    lineHeight: 1,
  },
  titleText: {
    fontSize: 15,
    fontWeight: 590,
    color: "#191F28",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  iconGroup: {
    display: "flex",
    alignItems: "center",
    height: 34,
    borderRadius: 99,
    backgroundColor: "rgba(0,23,51,0.02)",
    paddingLeft: 2,
    paddingRight: 2,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(0,27,55,0.1)",
    borderRadius: 1,
    flexShrink: 0,
  },
};
