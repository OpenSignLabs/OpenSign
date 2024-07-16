/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {}
  },
  plugins: [require("daisyui")],
  daisyui: {
    // themes: true,
    themes: [
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
      "dim",
      "nord",
      "sunset",
      {
        opensigncss: {
          primary: "#002864",
          "primary-content": "#cacccf",
          secondary: "#29354a",
          "secondary-content": "#c8d1e0",
          accent: "#E10032",
          "accent-content": "#ffd8d5",
          neutral: "#c1ccdb",
          "neutral-content": "#111312",
          "base-100": "#ffffff",
          "base-200": "#dedede",
          "base-300": "#bebebe",
          "base-content": "#161616",
          info: "#00b6ff",
          "info-content": "#f5f5f4",
          success: "#00a96e",
          "success-content": "#f5f5f4",
          warning: "#ffbe00",
          "warning-content": "#ccd9e8",
          error: "#ffa1a7",
          "error-content": "#16090a",
          "--rounded-btn": "1.9rem",
          "--tab-border": "2px",
          "--tab-radius": "0.7rem"
        }
      }
    ],
    prefix: "op-"
  }
};
