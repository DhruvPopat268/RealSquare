import { primaryColor } from "../utils/theme";

export default function CoinIcon({ size = 20, className = "", variant = "brand" }) {
  const background = variant === "gold"
    ? "linear-gradient(135deg, #f59e0b 60%, #fbbf24 100%)"
    : `linear-gradient(135deg, ${primaryColor} 60%, #a855f7 100%)`;

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        background,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          color: "#fff",
          fontWeight: 900,
          fontSize: size * 0.52,
          lineHeight: 1,
          fontFamily: "inherit",
          letterSpacing: "-0.5px",
        }}
      >
        R
      </span>
    </span>
  );
}
