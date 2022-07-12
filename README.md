# React template on ESBuild as a module bundler

____

## This project are testing [ESBuild](https://esbuild.github.io/) as build tool for React app example by tutorial video from [**Ulbi TV** YouTube-channel](https://www.youtube.com/watch?v=9wFfq5bLCgg).

* Initiate npm-project (generate `package.json` file):

      ```
      npm init
      ```

* Install the following npm packages (along the way):

    - `npm i -D esbuild`
    - `npm i -D cross-env` (of necessity)
    - `npm i dotenv`
    - `npm i react react-dom`
    - `npm i -D typescript ts-node @types/react @types/react-dom`
    - `npm i -D express @types/express`

### I. Simple package

   1. Create `src` source folder.

   2. Create entry point `index.js` file (specified when creating `package.json` by `npm init`).

   3. Create `public` folder and `index.html` file into it.

   4. Create start sctript into `package.json` file:
   
      ```json
      "scripts": {
        "build:simple": "esbuild ./src/index.js --bundle --outdir=\"build\""
      }
      ```

### II. Configurate package

  1. Create `config` folder and `build/esbuild-config.js` file into it.

  2. Write simple ESBuild config into `esbuild-config.js` file:

      ```js
      const ESbuild = require('esbuild')
      const path = require('path')

      const relativeFolder = dir => {
        return path.resolve(__dirname, '..', '..', `${dir}`)
      }

      ESbuild.build({
        sourceRoot: relativeFolder('src'),
        outdir: relativeFolder('build'),
        entryPoints: [relativeFolder('src/index.js')],
        entryNames: 'bundle',
        bundle: true
      })
      ```

  3. Add new start sctript into `package.json` file:
   
      ```json
      "scripts": {
        "build": "node ./config/build/esbuild-config.js"
      }
      ```
  
  4. Add development/production modes:

      ```js
      const mode = process.env.MODE || 'development'
      const isDev = mode === 'development'
      const isProd = mode === 'production'
      ```

      It's now possible to use the boolean consts `isDev` or `isProd` for config:

      ```js
      ESbuild.build({
        ...
        minify: isProd
        ...
      })
      ```

  5. The environment variables can be set via `cross-env` package.
      Change start sctript into `package.json` file:

      ```json
      "scripts": {
        "build": "cross-env MODE=production node ./config/build/esbuild-config.js",
        "build:dev": "cross-env MODE=development node ./config/build/esbuild-config.js"
      }
      ```

  6. Move `index.html` file into `build` folder. Check & edit `<script>` tag.

### III. Use React framework

  1. Install `react` & `react-dom` npm packages.

  2. Create new entry point `index.jsx` file into `src` folder:

      ```jsx
      import React from 'react'
      import { createRoot } from 'react-dom/client'
      import App from './App'

      const root = createRoot(document.getElementById('root'))
      root.render(<App />)
      ```

  3. Change `main` field into `package.json` file, `entryPoints` field into `esbuild-config.js` file and source of `<script>` tag into `index.html` file on `index.jsx`

  4. Add new `App.jsx` file into `src` folder:

      ```jsx
      import React, { useState } from 'react'

      function App() {
        const [counter, setCounter] = useState(1)
        return (
          <div>
            <span>Welcome to React!</span>
            <br />
            <h3>Counter = {counter}</h3>
            <button onClick={() => setCounter(counter + 1)}>Add +1</button>
          </div>
        )
      }

      export default App
      ```

### IV. Add CSS files

  1. Create `index.css` file into `src` folder.
  
  1. Import CSS file into `App.jsx` file:

      ```js
      import './index.css'
      ```

  1. Add link on `bundle.css` file into `index.html`:

      ```html
      <link rel="stylesheet" href="bundle.css" />
      ```

  1. Add `second.css` file to test the possibility of using multiple CSS files and add link on it into `App.jsx`.

### V. Add Source Maps (needs for testing purpose)

  1. Add `sourcemap` field into ESBuild config (`esbuild-config.js` file) for development mode only:

      ```js
      sourcemap: isDev
      ```
  1. Change `App.jsx` for testing exception:

      ```html
      <button onClick={() => { throw new Error() }}>
        Add +1
      </button>
      ```

### VI. Add dev-server

  1. Making configuration of ESBuild changes. The `esbuild-config.js` file will now only contain config of ESBuild:

      ```js
      const path = require('path')

      const relativeFolder = dir => {
        return path.resolve(__dirname, '..', '..', `${dir}`)
      }

      module.exports = {
        sourceRoot: relativeFolder('src'),
        outdir: relativeFolder('build'),
        entryPoints: [relativeFolder('src/index.jsx')],
        entryNames: 'bundle',
        bundle: true,
        minify: true
      }
      ```

  1. And wo additional build config files.
      `esbuild-dev.js` :

      ```js
      const ESBuild = require('esbuild')

      const config = require('./esbuild-config')

      const PORT = process.env.PORT || 3000

      ESBuild.serve(
        {
          servedir: config.outdir,
          port: PORT
        },
        {
          ...config,
          minify: false,
          sourcemap: true
        }
      )
        .then(() => {
          console.log(`Dev-server started on http://localhost:${PORT}`)
        })
        .catch(err => console.error(err))
      ```

  1. Add new start scripts into `package.json` file:

      ```json
      "scripts": {
        "build:simple": "esbuild ./src/index.js --bundle --outdir=\"build\"",
        "build": "cross-env MODE=production node ./config/build/esbuild-config.js",
        "build:dev": "cross-env MODE=development node ./config/build/esbuild-config.js",
        "build-app": "node ./config/build/esbuild-prod.js",
        "start": "node ./config/build/esbuild-dev.js"
      }
      ```

### VII. Convert ESBuild configuration from **JavaScript** to **TypeScript**

  1. Install `typescript`, `ts-node`, `@types/react` & `@types/react-dom` npm packages.

  1. First of all create `tsconfig.json` file into root folder the following content:

      ```json
      {
        "compilerOptions": {
          // target build folder 
          "outDir": "./build/",
          // ANY deny
          "noImplicitAny": true,
          "module": "ESNext",
          // bundle format (ecmascript 6 in this case)
          "target": "es6",
          "jsx": "react-jsx",
          // JavaScript file processing allow
          "allowJs": true,
          // strict mode on
          "strict": true,
          "esModuleInterop": true,
          "moduleResolution": "node",
          "allowSyntheticDefaultImports": true,
          // required field for ESBuild
          "isolatedModules": true
        },
        "ts-node": {
          "compilerOptions": {
            "module": "commonjs"
          }
        }
      }
      ```

  1. Rename `App.jsx` and `index.jsx` files to `.tsx` with the following content
      
      `App.tsx` :
      
      ```ts
      import React from 'react'
      import './index.css'
      import './second.css'

      function App() {
        const [counter, setCounter] = React.useState<number>(1)
        return (
          <div>
            <span>Welcome to React!</span>
            <br />
            <h3>Counter = {counter}</h3>
            <button onClick={() => setCounter(counter + 1)}>Add +1</button>
          </div>
        )
      }

      export default App
      ```

      `index.tsx` :

      ```ts
      import React from 'react'
      import { createRoot } from 'react-dom/client'
      import App from './App'

      const rootEl = document.getElementById('root')

      if (!rootEl) {
        throw new Error('Root element not found')
      }

      const root = createRoot(rootEl)
      root.render(<App />)
      ```

  1. Make new `build-ts` and add on it new config `".ts"` files
      `esbuild-config.ts` :

      ```ts
      import path from 'path'
      import { BuildOptions } from 'esbuild'

      const resolveRootFolder = (...segments: string[]) => {
        return path.resolve(__dirname, '..', '..', ...segments)
      }

      const config: BuildOptions = {
        sourceRoot: resolveRootFolder('src'),
        outdir: resolveRootFolder('build'),
        entryPoints: [resolveRootFolder('src/index.tsx')],
        entryNames: 'bundle',
        tsconfig: resolveRootFolder('tsconfig.json'),
        bundle: true,
        minify: true
      }

      export default config
      ```

      `esbuild-dev.ts` :

      ```ts
      import ESBuild from 'esbuild'
      import config from './esbuild-config'

      const PORT = Number(process.env.PORT) || 3000

      ESBuild.serve(
        {
          servedir: config.outdir,
          port: PORT
        },
        {
          ...config,
          minify: false,
          sourcemap: true
        }
      )
        .then(() => {
          console.log(`Dev-server started on http://localhost:${PORT}`)
        })
        .catch(err => console.error(err))
      ```

      `esbuild-prod.ts` :

      ```ts
      import ESBuild from 'esbuild'
      import config from './esbuild-config'

      ESBuild.build(config).catch(console.error)
      ```

  1. Change `"main"` field and add new start scripts into `package.json` file:

      ```json
      ...
      "main": "index.tsx",
      "scripts": {
        . . .
        "ts-build-app": "ts-node ./config/build-ts/esbuild-prod.ts",
        "ts-start": "ts-node ./config/build-ts/esbuild-dev.ts"
      }
      ```      

### VIII. Add handling static files (`.png`, `.jpeg`, `.svg` etc.)

  1. Copy any image file into `public` folder.

  1. Add into `esbuild-config.ts` loader declaration, for examle:

      ```ts
      loader: {
          '.jpg': 'file',
          '.png': 'file',
          '.svg': 'file'
        }
      ```

  1. Import the image file into `App.tsx`:

      ```js
      import pic from '../public/002.jpg'
      ```
      
      and use it:

      ```html
      <img src={pic} alt="Picture" />
      ```

### IX. Randomize naming bundle files (to avoid caching)

  1. Into `esbuild-config.ts` change one line to new:

      ```js
      ~~entryNames: 'bundle',~~
      entryNames: '[dir]/bundle.[name]-[hash]',
      ```

### X. Automate clear output folder

  1. For automate clear an output folder use custom plugin.

  1. For creating `CleanPlugin` plugin add `CleanPlugin.ts` file into `config/plugins` folder with the following content:

      ```js
      import { Plugin } from 'esbuild'
      import { rm } from 'fs/promises'

      export const CleanPlugin: Plugin = {
        name: 'CleanPlugin',
        setup(build) {
          build.onStart(async () => {
            try {
              const outdir = build.initialOptions.outdir
              if (outdir) {
                await rm(outdir, { recursive: true })
              }
            } catch (error) {
              console.error("Can't clear output folder...", error)
            }
          })
        }
      }
      ```

  1. Add into `esbuild-config.ts` plugins declaration:

      ```js
      import { CleanPlugin } from '../plugins/CleanPlugin'

      const config: BuildOptions = {
        ...
        plugins: [CleanPlugin]
        ...
      }
      ```

### XI. Create custom dev-server

  1. Install `express` & `@types/express` npm packages for development use.

      ```
      ```