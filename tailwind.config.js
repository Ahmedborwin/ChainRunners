/** @type {import('tailwindcss').Config} */
module.exports = {
    purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    darkMode: false, // or 'media' or 'class'
    extend: {
        backgroundImage: (theme) => ({
            "maps-image": "url('/path/to/mapsImage.jpg')", // replace with your static image path
        }),
    },
    theme: {
        extend: {},
    },
    variants: {
        extend: {},
    },
    plugins: [],
}
