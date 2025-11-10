import external from 'rollup-plugin-peer-deps-external';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [external()],
	build: {
		outDir: './dist',
		target: 'es6',
        minify: false,
		lib: {
			entry: 'src/main.ts',
			formats: ['iife'],
			fileName: 'main',
            name: 'spellchecker'
		},
		rollupOptions: {
			external: ['acode', 'fs'],
			output: {
				inlineDynamicImports: true,
                entryFileNames: '[name].js',
			},
		},
	},
	// test: {
	// 	retry: process.env.CI ? 5 : 0,
	// 	browser: {
	// 		provider: 'playwright',
	// 		enabled: true,
	// 		headless: true,
	// 		screenshotFailures: false,
	// 		instances: [{ browser: 'chromium' }],
	// 	},
	// },
});