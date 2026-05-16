const PUPPY_BLUE = "/assets/puppy-blue.svg";
const PUPPY_BROWN = "/assets/puppy-brown.svg";
const CAT_BLUE = "/assets/cat-blue.svg";
const CAT_BROWN = "/assets/cat-brown.svg";

interface AnimalProps {
  type?: "Puppy" | "Cat";
  color?: "Blue" | "Brown";
  size?: number;
  style?: React.CSSProperties;
}

export default function Animal({ type = "Puppy", color = "Blue", size = 18, style }: AnimalProps) {
  const src =
    type === "Cat"
      ? color === "Brown" ? CAT_BROWN : CAT_BLUE
      : color === "Brown" ? PUPPY_BROWN : PUPPY_BLUE;

  return (
    <div style={{ width: size, height: size, overflow: "hidden", position: "relative", flexShrink: 0, ...style }}>
      <img src={src} alt={`${type} ${color}`} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
