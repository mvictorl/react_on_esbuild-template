import { Plugin } from 'esbuild'
import { rm } from 'fs/promises'

export const CleanPlugin: Plugin = {
	name: 'CleanPlugin',
	setup(build) {
		build.onStart(async () => {
			try {
				const outdir = build.initialOptions.outdir
				if (outdir) {
					await rm(outdir, { recursive: true, force: true })
				}
			} catch (error) {
				console.error("Can't clear output folder...", error)
			}
		})
	}
}
