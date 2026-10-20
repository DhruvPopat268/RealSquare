export const primaryColor = import.meta.env.VITE_PRIMARY_COLOR || "#7B2FFF";

/**
 * Parse a hex color string into { r, g, b }.
 */
function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const full  = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean;
  const num = parseInt(full, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8)  & 255,
    b:  num        & 255,
  };
}

/**
 * Convert { r, g, b } back to a hex string.
 */
function rgbToHex({ r, g, b }) {
  return "#" + [r, g, b]
    .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Darken a hex color by mixing it with black by `amount` (0–1).
 * amount=0.18 → 18% darker.
 */
function darken(hex, amount = 0.18) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex({
    r: r * (1 - amount),
    g: g * (1 - amount),
    b: b * (1 - amount),
  });
}

/**
 * Create a very light tint of a hex color by mixing it with white by `amount` (0–1).
 * amount=0.88 → 88% white mixed in → very light tint.
 */
function lighten(hex, amount = 0.88) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex({
    r: r + (255 - r) * amount,
    g: g + (255 - g) * amount,
    b: b + (255 - b) * amount,
  });
}

export const primaryColorHover = darken(primaryColor, 0.18);
export const primaryColorLight = lighten(primaryColor, 0.88);

if (typeof document !== "undefined") {
  document.documentElement.style.setProperty("--primary-color",       primaryColor);
  document.documentElement.style.setProperty("--primary-color-hover", primaryColorHover);
  document.documentElement.style.setProperty("--primary-color-light", primaryColorLight);
}
