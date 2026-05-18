import Animal from "./Animal";

interface AnimalProfileProps {
  type?: "Puppy" | "Cat";
  size?: number;
  style?: React.CSSProperties;
}

export default function AnimalProfile({ type = "Puppy", size = 42, style }: AnimalProfileProps) {
  const iconSize = Math.round(size * (24 / 42));

  return (
    <div style={{ width: size, height: size, borderRadius: size, backgroundColor: "#508FE1", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, ...style }}>
      <Animal type={type} color="Blue" size={iconSize} />
    </div>
  );
}
