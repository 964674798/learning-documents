/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xxs': '320px',  // 超小屏幕，如iPhone SE
        'xs': '375px',   // 小屏幕手机，如iPhone X/11/12 mini
      }
    },
  },
  plugins: [
    typography(),
  ],
}