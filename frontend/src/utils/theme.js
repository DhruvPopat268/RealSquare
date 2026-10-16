export const primaryColor = import.meta.env.VITE_PRIMARY_COLOR || "#7B2FFF";

console.log("Primary Color:", primaryColor);

if (typeof document !== "undefined") {
  document.documentElement.style.setProperty("--primary-color", primaryColor);
}
