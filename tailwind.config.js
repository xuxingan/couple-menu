/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'bili-pink': '#FB7299',
        'bili-blue': '#00A1D6',
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["synthwave"],
    darkTheme: "synthwave",
  },
}

