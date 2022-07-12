import { Plugin } from 'esbuild'
import fs from 'fs/promises'
import path from 'path'

require('dotenv').config()
const PORT = Number(process.env.PORT) || 3030

const block = `
	<script>
	const eventSource = new EventSource("http://localhost:${PORT}/subscribe")
	eventSource.onerror = () => { console.log('Error with live-server') }
	eventSource.onmessage = () => { window.location.reload() }
	</script>
`

interface HTMLPluginOptions {
	template?: string
	title?: string
	jsPath?: string[]
	cssPath?: string[]
	isDev?: boolean
}

const renderHtml = async (options: HTMLPluginOptions): Promise<string> => {
	if (options.template) {
		let temp = await fs.readFile(options.template, 'utf-8')
		if (options.title) {
			temp = temp.replace(
				new RegExp('(?<=<title>).*?(?=</title>)', 's'),
				options.title
			)
		}
		if (options.cssPath) {
			temp = temp.replace(
				/\<title>/,
				`${options.cssPath
					.map(path => `<link href=${path} rel="stylesheet">\n`)
					.join(' ')}` + '$&'
			)
		}
		if (options.jsPath) {
			temp = temp.replace(
				/\<\/body>/,
				`${options.jsPath
					.map(path => `<script src=${path}></script>\n`)
					.join(' ')}` + '$&'
			)
		}
		if (options.isDev) {
			temp = temp.replace(/\<\/body>/, block + '$&')
		}
		return temp
	} else {
		return (
			options.template ||
			`
			<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="UTF-8" />
					<meta http-equiv="X-UA-Compatible" content="IE=edge" />
					<meta name="viewport" content="width=device-width, initial-scale=1.0" />
					<title>${options.title}</title>
					${options?.cssPath
						?.map(path => `<link href=${path} rel="stylesheet">\n`)
						.join(' ')}
				</head>
				<body>
					<div id="root"></div>
					${options?.jsPath?.map(path => `<script src=${path}></script>\n`).join(' ')}
						<script>
							const eventSource = new EventSource('http://localhost:${PORT}/subscribe')
							eventSource.onerror = () => { console.log('Error with live-server') }
							eventSource.onmessage = () => { window.location.reload() }
						</script>
				</body>
			</html>
			`
		)
	}
}

const preparePaths = (outputs: string[]) => {
	return outputs.reduce<Array<string[]>>(
		(acc, path) => {
			const [js, css] = acc
			const splittedFileName = path.split('/').pop()

			if (splittedFileName?.endsWith('.js')) {
				js.push(splittedFileName)
			} else if (splittedFileName?.endsWith('.css')) {
				css.push(splittedFileName)
			}

			return acc
		},
		[[], []]
	)
}

export const IndexHtmlPlugin = (options: HTMLPluginOptions): Plugin => {
	return {
		name: 'IndexHtmlPlugin',
		setup(build) {
			const outdir = build.initialOptions.outdir

			build.onEnd(async result => {
				const outputs = result.metafile?.outputs
				const [jsPath, cssPath] = preparePaths(Object.keys(outputs || {}))

				if (outdir) {
					try {
						await fs.writeFile(
							path.resolve(outdir, 'index.html'),
							await renderHtml({ jsPath, cssPath, ...options }),
							'utf-8'
						)
					} catch (err) {
						console.error(err)
					}
				}
			})
		}
	}
}
