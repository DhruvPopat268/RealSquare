export default function CoinIcon({ size = 20, className = "" }) {
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
        background: "linear-gradient(135deg, #7B2FFF 60%, #a855f7 100%)",
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
