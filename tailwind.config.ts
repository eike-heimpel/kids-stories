import containerQueries from '@tailwindcss/container-queries';
import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			animation: {
				'bounce-slow': 'bounce 3s infinite',
			},
			fontFamily: {
				'kidstory': ['Comic Sans MS', 'Comic Sans', 'cursive']
			}
		}
	},

	plugins: [containerQueries, daisyui],

	daisyui: {
		themes: [
			{
				kidstory: {
					"primary": "#4A90E2",
					"secondary": "#50C878",
					"accent": "#FFB347",
					"neutral": "#6B7280",
					"base-100": "#FAFAFA",
					"info": "#67B7DC",
					"success": "#68D391",
					"warning": "#F6C23E",
					"error": "#F87272",
					"--rounded-box": "1rem",
					"--rounded-btn": "0.8rem",
					"--rounded-badge": "1.9rem",
					"--animation-btn": "0.25s",
					"--animation-input": "0.2s",
					"--btn-focus-scale": "0.95",
					"--border-btn": "2px",
					"--tab-border": "2px",
					"--tab-radius": "0.8rem",
				},
			},
			"light",
			"cupcake"
		],
		darkTheme: "kidstory",
		base: true,
		themeRoot: ':root',
		logs: false,
	}
} satisfies Config;
