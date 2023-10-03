const { theme } = require( '@memewar/config/tailwind.config' ).default

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,jsx,ts,tsx}',
        '../../packages/**/*.{js,jsx,ts,tsx}',
    ],
    plugins: [require( 'nativewind/tailwind/css' )],
    important: 'html',
    theme: {
        ...theme,
    },
}
