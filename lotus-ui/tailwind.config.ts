import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				// Lotus Bridge Custom Colors
				"lotus-pink": {
					DEFAULT: "hsl(var(--lotus-pink))",
					light: "hsl(var(--lotus-pink-light))",
					dark: "hsl(var(--lotus-pink-dark))",
				},
				"lotus-green": {
					DEFAULT: "hsl(var(--lotus-green))",
					light: "hsl(var(--lotus-green-light))",
					dark: "hsl(var(--lotus-green-dark))",
				},
				"lotus-white": "hsl(var(--lotus-white))",
				"lotus-cream": "hsl(var(--lotus-cream))",
				"dong-son-bronze": "hsl(var(--dong-son-bronze))",
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			keyframes: {
				"accordion-down": {
					from: {
						height: "0",
					},
					to: {
						height: "var(--radix-accordion-content-height)",
					},
				},
				"accordion-up": {
					from: {
						height: "var(--radix-accordion-content-height)",
					},
					to: {
						height: "0",
					},
				},
				"lotus-bloom": {
					"0%": {
						transform: "scale(0.8) rotate(0deg)",
						opacity: "0.7",
					},
					"50%": {
						transform: "scale(1.05) rotate(180deg)",
						opacity: "1",
					},
					"100%": {
						transform: "scale(1) rotate(360deg)",
						opacity: "0.9",
					},
				},
				"lotus-float": {
					"0%, 100%": {
						transform: "translateY(0px)",
					},
					"50%": {
						transform: "translateY(-10px)",
					},
				},
				"gradient-shift": {
					"0%, 100%": {
						"background-position": "0% 50%",
					},
					"50%": {
						"background-position": "100% 50%",
					},
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"lotus-bloom": "lotus-bloom 3s ease-in-out",
				"lotus-float": "lotus-float 6s ease-in-out infinite",
				"gradient-shift": "gradient-shift 6s ease infinite",
			},
			backdropBlur: {
				"3xl": "64px",
				"4xl": "128px",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
