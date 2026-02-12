/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // --- SHASO "Abyssal" Palette (High Contrast) ---
                // User Provided:
                // Ink: #002029 (Background)
                // Jet: #00303d (Surface)
                // Teal 1: #004052 (Border/Weak)
                // Teal 2: #005066 (Active)
                // Teal 3: #00607a (Highlight)

                ink: {
                    DEFAULT: '#002029',
                    50: '#00303d', // Jet (Cards) - Lighter than BG
                    100: '#002029', // Ink (Main BG) - Darkest
                    200: '#004052', // Teal 1
                    300: '#005066', // Teal 2
                    400: '#00607a', // Teal 3
                    500: '#002029',
                    600: '#0083a7',
                    700: '#00c6fd',
                    800: '#ffffff', // Text Primary
                    900: '#ffffff', // Text Primary
                    950: '#e0f7ff'
                },

                // --- COMPATIBILITY MAPPINGS ---
                // We map the standard 'zinc' scale to our Custom Dark Palette.
                // The App is built with 'zinc-100' as background and 'zinc-900' as text.
                // So we INVERT the scale: 
                // Low numbers (100) = Dark Backgrounds
                // High numbers (900) = Light Text
                zinc: {
                    50: '#00303d', // Cards (Jet Black) - Distinct from BG
                    100: '#002029', // Main App Background (Ink Black)
                    200: '#004052', // Borders/Separators (Dark Teal 1)
                    300: '#005066', // Secondary Borders (Dark Teal 2)
                    400: '#00607a', // Muted Text / Icons (Dark Teal 3)
                    500: '#5c7c8a', // Disabled/Placeholder
                    600: '#94b8c5', // Secondary Text
                    700: '#cceeff', // Highlighting
                    800: '#e0f7ff', // Almost White
                    900: '#ffffff', // Primary Text (Pure White for Contrast)
                    950: '#ffffff'
                },
                // Action Color
                lime: {
                    400: '#00c6fd', // Bright Cyan (High Contrast)
                    500: '#0090b8', // Button BG (Teal)
                    600: '#00607a', // Button Hover
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['Space Mono', 'monospace'],
            }
        },
    },
    plugins: [],
}
