/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        // Default sans font will use Inter
        'sans': ['Inter', 'System'],
        // Specific font families
        'inter': ['Inter'],
        'inter-medium': ['Inter-Medium'],
        'inter-semibold': ['Inter-SemiBold'], 
        'inter-bold': ['Inter-Bold'],
      },
    },
  },
  plugins: [],
}