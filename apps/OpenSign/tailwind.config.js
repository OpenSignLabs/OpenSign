/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {}
  },
  plugins: [
    require("daisyui"),
    function ({ addUtilities, addVariant }) {
      // ✅ Variants that match html[data-theme="..."] (or any ancestor with data-theme)
      addVariant("opensigncss", '[data-theme="opensigncss"] &');
      addVariant("opensigndark", '[data-theme="opensigndark"] &');

      addUtilities({
        // Prevent iOS long-press popup
        ".touch-callout-none": {
          "-webkit-touch-callout": "none"
        },
        // VS Code-style disabled button for all themes
        ".op-btn-vscode-disabled": {
          "background-color": "#3C3C3C !important",
          color: "#CCCCCC !important",
          "border-color": "#565656 !important",
          cursor: "not-allowed !important",
          opacity: "1 !important",
          "&:hover": {
            "background-color": "#3C3C3C !important",
            color: "#CCCCCC !important",
            "border-color": "#565656 !important",
            transform: "none !important"
          }
        },
        // Dark mode icon improvements using DaisyUI theme detection
        '[data-theme="opensigndark"] .icon-improved': {
          color: "#CCCCCC !important"
        },
        '[data-theme="opensigndark"] .icon-muted': {
          color: "#999999 !important"
        },
        '[data-theme="opensigndark"] .icon-disabled': {
          color: "#858585 !important"
        },
        // Gray text improvements for dark mode
        '[data-theme="opensigndark"] .text-gray-500': {
          color: "#CCCCCC !important"
        },
        '[data-theme="opensigndark"] .text-gray-400': {
          color: "#999999 !important"
        },
        '[data-theme="opensigndark"] .text-gray-600': {
          color: "#CCCCCC !important"
        },
        // CSS variable utilities that work with arbitrary values
        ".icon-themed": {
          color: "var(--icon-color)"
        },
        ".icon-themed-muted": {
          color: "var(--icon-color-muted)"
        },
        ".icon-themed-disabled": {
          color: "var(--icon-color-disabled)"
        },
        ".btn-themed-disabled": {
          "background-color": "var(--btn-disabled-bg)",
          color: "var(--btn-disabled-color)",
          "border-color": "var(--btn-disabled-border)",
          cursor: "not-allowed",
          "&:hover": {
            "background-color": "var(--btn-disabled-bg)",
            color: "var(--btn-disabled-color)",
            "border-color": "var(--btn-disabled-border)",
            transform: "none"
          }
        }
      });
    }
  ],
  daisyui: {
    // themes: true,
    themes: [
      {
        opensigndark: {
          primary: "#2F6FDE",
          "primary-content": "#F7F9FC",

          secondary: "#16275C",
          "secondary-content": "#F7F9FC",

          accent: "#E0A030",
          "accent-content": "#16275C",

          neutral: "#142942",
          "neutral-content": "#f1f5fa",

          "base-100": "#16263b",
          "base-200": "#0b2347",
          "base-300": "#294764",
          "base-content": "#f1f5fa",

          info: "#2b6099",
          success: "#4a8fca",
          warning: "#e2657b",
          error: "#f07b8e",

          "--rounded-btn": "0.7rem",
          "--tab-border": "2px",
          "--tab-radius": "0.7rem",

          // Custom CSS variables for icon and button states
          "--icon-color": "#f1f5fa",
          "--icon-color-muted": "#b3c1d2",
          "--icon-color-disabled": "#788da7",
          "--btn-disabled-bg": "#294764",
          "--btn-disabled-color": "#b3c1d2",
          "--btn-disabled-border": "#456483",

          // Optional polish
          "--navbar-padding": "0.8rem",
          "--border-color": "#456483",
          "--tooltip-color": "#06162f"
        }
      },
      {
        opensigncss: {
          primary: "#2F6FDE",
          "primary-content": "#f7f9fc",
          secondary: "#16275C",
          "secondary-content": "#f7f9fc",
          accent: "#E0A030",
          "accent-content": "#16275C",
          neutral: "#142942",
          "neutral-content": "#f7f9fc",
          "base-100": "#f7f9fc",
          "base-200": "#edf2f8",
          "base-300": "#d8e2ee",
          "base-content": "#142942",
          info: "#2b6099",
          "info-content": "#f7f9fc",
          success: "#4a8fca",
          "success-content": "#f7f9fc",
          warning: "#e2657b",
          "warning-content": "#142942",
          error: "#d62f4f",
          "error-content": "#f7f9fc",
          "--rounded-btn": "0.7rem",
          "--tab-border": "2px",
          "--tab-radius": "0.7rem"
        }
      }
    ],
    prefix: "op-"
  }
};
