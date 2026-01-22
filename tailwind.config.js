/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#00C27A", // Fresh Mint Green
        background: "#F7FBFA", // Mint Tint White
        surface: "#FFFFFF", // Pure White
        secondary: "#1A1A1A", // Dark Text
        muted: "#8E8E93", // Grey Text
        error: "#FF3B30", // Red Alert
      },
      fontFamily: {
        sans: ['Inter', 'System'],
      }
    },
  },
  plugins: [],
}
