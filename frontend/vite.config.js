/** @type {import('tailwindcss').Config} */
import react from '@vitejs/plugin-react'
import { build } from 'vite'
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [react()],
  build: {
    outDir: 'dist', // This outputs to frontend/dist
    emptyOutDir: true,
  }
}