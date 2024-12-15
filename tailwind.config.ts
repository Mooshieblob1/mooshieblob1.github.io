import type { Config } from "tailwindcss";

export default {
	content: [
		"{routes,islands,components}/**/*.{ts,tsx,js,jsx}",
	],
	css: [
		"~/static/css/styles.css",
	],
	darkMode: "media",
	theme: {
		extend: {},
	},
} satisfies Config;
