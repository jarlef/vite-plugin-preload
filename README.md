# vite-plugin-preload

[![npm version](https://badge.fury.io/js/vite-plugin-preload.svg)](https://badge.fury.io/js/vite-plugin-preload)

A Plugin to preload all chunks and stylesheets when dealing with code splitting through
frameworks (e.g React.lazy) instead of manualChunks in Vite

## Installation

```sh
yarn add vite-plugin-preload --dev
```

or

```sh
npm i vite-plugin-preload -D
```

## Usage

Configuration

```javascript
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import preload from "vite-plugin-preload";

export default defineConfig({
  plugins: [react(), preload()],
});
```

### Options

```ts
interface PreloadOptions {
  includeJs: boolean;
  includeCss: boolean;
  format?: boolean | Omit<PrettierOptions, "parser">;
  mode?: 'preload' | 'prefetch';
  shouldPreload: (chunkInfo: OutputChunk | OutputAsset) => boolean;
  generatePreloadManifestJsonPath?: string
}
```

Html before:

```html
<html>
  <head>
    <title>React example</title>
    <script
      type="module"
      crossorigin=""
      src="/assets/index.06e372d5.js"
    ></script>
    <link rel="modulepreload" href="/assets/vendor.4fa92e17.js" />
    <link rel="stylesheet" href="/assets/index.5de8cc00.css" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

Html after:

```html
<html>
  <head>
    <title>React example</title>
    <script
      type="module"
      crossorigin=""
      src="/assets/index.06e372d5.js"
    ></script>
    <link rel="modulepreload" href="/assets/vendor.4fa92e17.js" />
    <link rel="stylesheet" href="/assets/index.5de8cc00.css" />
    <link rel="modulepreload" href="/assets/index.470dc361.js" />
    <link rel="modulepreload" href="/assets/index.f2bd501d.js" />
    <link rel="modulepreload" href="/assets/index.79b31f97.js" />
    <link rel="stylesheet" href="/assets/index.e3157e37.css" />
    <link rel="stylesheet" href="/assets/index.2921fa01.css" />
    <link rel="stylesheet" href="/assets/index.ef9b644c.css" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

## Code splitting

When producing code splits using manual chunking in rollup, all chunks are added to
the entry html file (index.html) as `<script type="preloadmodule" src="/assets/foo.12345.js"></script>`.
Code splitting is performed by a configured rule that is not based on how the application is structured. Its mearly splitting the code into smaller chunks. If this is your cup of tea, then you are all good. You don't need this plugin.

If you however decide to use the react way of performing code splitting by triggering import inside `React.lazy`. This will also produced chunks that are not added as preloaded modules. This is by design, as the React.lazy fetches the module async when it is needed. React.lazy is also the most natural way of performing code splitting based on component level, e.g by navigation pages in react-router og clearly defined modules in the code (pages, shared, modula-a, module-b etc).

## But why then?

In short. Performance and stability.

### Performance. Developer performance that is

Code splitting is good for developer performance. As your code base grows, more files are sent from your
src directory when starting the vite dev server. This can be slow. Really slow. Why pre-serve the entire code base when its not needed. Using code splitting with Reacy.lazy, vite is only serving the modules used for the currently loaded component tree and load more chunks is performed async. Hurray

### Stability

Now the plot thickens. Lets say you deploy your application and it produces 3 javascript chunks (index.1.js, index.2.js and index.3.js) and only the entry chunk is served. The user uses your application and decides to navigate to a sub route which you have flagged with React.lazy (e.g its located in index.3.js). In the mean time you have just trigged a new deploy and the chunks are now different. index.3.js is no longer there and have been replaced by index.4.js. The user receives a dynamic import error when trying to fetch the outdated chunk. The solution for the user is to refresh the entire page in the browser. This could have been avoided by just preloading all the chunks. Be aware that this of course is a trade off on the initial app load time.
