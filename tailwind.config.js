/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                },
                accent: {
                    50: '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    300: '#fdba74',
                    400: '#fb923c',
                    500: '#f97316',
                    600: '#ea580c',
                    700: '#c2410c',
                    800: '#9a3412',
                    900: '#7c2d12',
                },
                // New Midnight Theme Colors
                midnight: {
                    900: '#020617', // Deepest Slate
                    800: '#0f172a', // Dark Slate
                    700: '#1e293b', // Slate
                    card: 'rgba(30, 41, 59, 0.5)', // Glassmorphism base
                },
                violet: {
                    500: '#8b5cf6',
                    600: '#7c3aed',
                    glow: 'rgba(139, 92, 246, 0.5)',
                },
                custom: {
                    blue: '#5D79A0',
                    gray: '#6B7D8B',
                },
                // App sidebar color palette
                app: {
                    sidebar: '#2D3E50',
                    sidebarHover: '#3D5A73',
                    sidebarActive: '#4A6B83',
                    sidebarText: '#D1D2D3',
                    sidebarMuted: '#9CA3AF',
                    accent: '#00A884',
                    accentHover: '#008F72',
                    border: '#3C4E5C',
                    contentBg: '#FFFFFF',
                    threadBg: '#F8F9FA',
                },
                // Ocean color palette based on #0C3D5F - primary accent
                ocean: {
                    950: '#06202F',
                    900: '#0C3D5F',
                    800: '#0F4D78',
                    700: '#136092',
                    600: '#1A78B0',
                    500: '#2290CC',
                    400: '#4AADD8',
                    300: '#7BC5E5',
                    200: '#B0DCF0',
                    100: '#DAF0F8',
                    50: '#EEF8FB',
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            },
                'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #020617 0deg, #0f172a 180deg, #020617 360deg)',
                'aurora': 'linear-gradient(to top right, #fff 50%, #eef2ff 100%)',
            },
            animation: {
                'blob': 'blob 7s infinite',
                'slide-up': 'slideUp 0.8s ease-out forwards',
                'fade-in': 'fadeIn 1s ease-out forwards',
                'bounce-slow': 'bounce 3s infinite',
                'spin-slow': 'spin 12s linear infinite',
                'pulse-glow': 'pulseGlow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'aurora': 'aurora 60s linear infinite',
                'float': 'float 6s ease-in-out infinite',
                'float-delayed': 'float 6s ease-in-out 3s infinite',
                'tilt': 'tilt 10s infinite linear',
                'pulse-bar': 'pulseBar 3s ease-in-out infinite',
            },
            keyframes: {
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                pulseGlow: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '.5' },
                },
                aurora: {
                    '0%': { backgroundPosition: '50% 50%, 50% 50%' },
                    '100%': { backgroundPosition: '350% 50%, 350% 50%' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                tilt: {
                    '0%, 50%, 100%': { transform: 'rotate(0deg)' },
                    '25%': { transform: 'rotate(1deg)' },
                    '75%': { transform: 'rotate(-1deg)' },
                },
                pulseBar: {
                    '0%, 100%': { opacity: '0.4', transform: 'scaleX(0.9)' },
                    '50%': { opacity: '1', transform: 'scaleX(1)' },
                },
        },
    },
    plugins: [],
}
