import ESBuild from 'esbuild'
import config from './esbuild-config'
import path from 'path'
import express from 'express'
import { EventEmitter } from 'events'

require('dotenv').config()
const PORT = Number(process.env.PORT) || 3030

const app = express()
const emitter = new EventEmitter()

app.use(express.static(path.resolve(__dirname, '..', '..', 'build')))

app.get('/subscribe', (req, res) => {
	const headers = {
		'Content-Type': 'text/event-stream',
		Connection: 'keep-alive',
		'Cache-Control': 'no-cache'
	}
	res.writeHead(200, headers)
	res.write('')

	emitter.on('refresh', () => {
		res.write('data: message \n\n')
	})
})

function sendMessage() {
	emitter.emit('refresh', '123123')
}

app.listen(PORT, () =>
	console.log(`Dev-server started on http://localhost:${PORT}`)
)

// ESBuild.serve(
// 	{
// 		servedir: config.outdir,
// 		port: PORT
// 	},
// 	{
// 		...config,
// 		minify: false,
// 		sourcemap: true
// 	}
// )

ESBuild.build({
	...config,
	watch: {
		onRebuild(err, result) {
			if (err) {
				console.log(err)
			} else {
				console.log(
					'Re-build...',
					`Err: ${result?.errors.length};`,
					`Warn: ${result?.warnings.length}`
				)
				console.log('Out files:', Object.keys(result?.metafile?.outputs || {}))
				console.log()
				sendMessage()
			}
		}
	}
})
	.then(res => {
		console.log('Watching...')
	})
	.catch(err => console.error(err))
