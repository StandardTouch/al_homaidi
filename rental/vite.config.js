import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'

export default defineConfig(async ({ mode }) => {
	const isDev = mode === 'development'
	const frappeui = await importFrappeUIPlugin(isDev)

	const config = {
		define: {
			__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
		},
		plugins: [
			frappeui({
				frappeProxy: true,
				lucideIcons: true,
				jinjaBootData: true,
				buildConfig: {
					indexHtmlPath: '../al_homaidi/www/rental.html',
				},
			}),
			vue(),
			{
				name: 'copy-html-entry',
				writeBundle() {
					const src = path.resolve(__dirname, '../al_homaidi/public/rental/index.html')
					const dest = path.resolve(__dirname, '../al_homaidi/www/rental.html')
					if (fs.existsSync(src)) {
						fs.copyFileSync(src, dest)
					}
				}
			},
		],
		server: {
			host: '0.0.0.0', // Accept connections from any network interface
			allowedHosts: true,
		},
		resolve: {
			alias: {
				'@': path.resolve(__dirname, 'src'),
			},
		},
		build: {
			outDir: `../${path.basename(path.resolve('..'))}/public/rental`,
			emptyOutDir: true,
			target: 'es2015',
		},
		optimizeDeps: {
			include: [
				'feather-icons',
				'tailwind.config.js',
			],
			exclude: mode === 'production' ? [] : ['frappe-ui'],
		},
	}
	return config
})

async function importFrappeUIPlugin(isDev) {
	if (isDev) {
		try {
			const module = await import('../frappe-ui/vite')
			return module.default
		} catch (error) {
			console.warn(
				'Local frappe-ui not found, falling back to npm package:',
				error.message
			)
		}
	}
	// Fall back to npm package if local import fails
	const module = await import('frappe-ui/vite')
	return module.default
}
