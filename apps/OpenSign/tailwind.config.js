/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
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
          primary: "#034687",
          "primary-content": "#ccd9e8",
          secondary: "#151B25",
          "secondary-content": "#cacccf",
          accent: "#E10032",
          "accent-content": "#ffd8d5",
          neutral: "#F0D7D9",
          "neutral-content": "#141111",
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
          error: "#ff0000",
          "error-content": "#f3f4f6"
        }
      }
    ],
    prefix: "op-"
  }
};
