// web/tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      animation: {
        typing: "typing 2s steps(24, end), blink .75s step-end infinite",
      },
      keyframes: {
        typing: {
          "from": { width: "0" },
          "to": { width: "100%" }
        },
        blink: {
          "from, to": { "border-color": "transparent" },
          // Use a specific color for the cursor
          "50%": { "border-color": "#10b981" }, // test
        }
      }
    },
  },
  plugins: [],
};