/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}"],
    theme: {
        container: {
            center: true,
        },
        extends: {
            colors: {
                whitesmoke: "#f5f5f5",
            },
        },
    },
    plugins: [require("daisyui")],
};
