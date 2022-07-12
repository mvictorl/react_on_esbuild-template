import path from 'path'
import { BuildOptions } from 'esbuild'
import { CleanPlugin } from '../plugins/CleanPlugin'
import { IndexHtmlPlugin } from '../plugins/IndexHtmlPlugin'

require('dotenv').config()
const title = process.env.TITLE || 'Home'
const mode = process.env.MODE || 'production'

const isDev = mode === 'development'
const isProd = mode === 'production'

const resolveRootFolder = (...segments: string[]) => {
	return path.resolve(__dirname, '..', '..', ...segments)
}

const config: BuildOptions = {
	sourceRoot: resolveRootFolder('src'),
	outdir: resolveRootFolder('build'),
	entryPoints: [resolveRootFolder('src', 'index.tsx')],
	// entryNames: 'bundle',
	entryNames: isDev ? '[dir]/bundle.[name]-[hash]' : 'bundle',
	allowOverwrite: true,
	tsconfig: resolveRootFolder('tsconfig.json'),
	bundle: true,
	sourcemap: isDev,
	minify: isProd,
	loader: {
		'.jpg': 'file',
		'.png': 'file',
		'.svg': 'file'
	},
	metafile: true,
	plugins: [
		CleanPlugin,
		IndexHtmlPlugin(
			isDev
				? {
						template: resolveRootFolder('public', 'index.html'),
						title: title,
						isDev: true
				  }
				: {
						template: resolveRootFolder('public', 'index.html'),
						title: title,
						isDev: false
				  }
		)
	]
}

export default config
