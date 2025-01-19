import { defaultOptions, PreloadOptions } from "./options";
import { createFilter } from "@rollup/pluginutils";
import { Plugin, ResolvedConfig } from "vite";
import {
  appendToDom,
  createDom,
  createModulePreloadLinkElement,
  createStylesheetLinkElement,
  createPrefetchLinkElement,
  getExistingLinks,
} from "./dom-utils";
import prettier from "prettier";
import { resolve } from "url";
import { dirname, normalize, resolve as resolvePath } from "path";
import fs, { promises as fsAsync } from "fs";

const jsFilter = createFilter(["**/*-*.js"]);
const cssFilter = createFilter(["**/*-*.css"]);

export default function VitePluginPreloadAll(
  options?: Partial<PreloadOptions>
): Plugin {
  let viteConfig: ResolvedConfig;
  const mergedOptions = { ...defaultOptions, ...options };
  let additionalModules: string[] = [];
  let additionalStylesheets: string[] = [];
  return {
    name: "vite:vite-plugin-preload",
    enforce: "post",
    apply: "build",
    configResolved(config) {
      viteConfig = config;
    },
    async writeBundle({ dir }) {
      if (!dir || !mergedOptions.generatePreloadManifestJsonPath) {
        return;
      }
      const preloadJsonPath = resolvePath(
        dir,
        mergedOptions.generatePreloadManifestJsonPath
      );
      const parentDir = dirname(preloadJsonPath);
      if (!fs.existsSync(parentDir)) {
        await fsAsync.mkdir(parentDir);
      }
      const manifestJson = fs.existsSync(preloadJsonPath)
        ? JSON.parse(fs.readFileSync(preloadJsonPath, "utf8"))
        : {};
      manifestJson.preloadModules = additionalModules;
      manifestJson.preloadStylesheets = additionalStylesheets;
      await fsAsync.writeFile(
        preloadJsonPath,
        JSON.stringify(manifestJson, null, 2)
      );
    },
    transformIndexHtml: {
      order: "post",
      handler: (html, ctx) => {
        if (!ctx.bundle) {
          return html;
        }

        const base = viteConfig.base ?? "";
        const dom = createDom(html);
        const existingLinks = getExistingLinks(dom);

        for (const bundle of Object.values(ctx.bundle)) {
          const path = resolve(base, bundle.fileName);
          if (
            existingLinks.includes(normalize(path)) ||
            !mergedOptions.shouldPreload(bundle)
          ) {
            continue;
          }

          if (
            mergedOptions.includeJs &&
            bundle.type === "chunk" &&
            jsFilter(bundle.fileName)
          ) {
            additionalModules.push(path);
          }

          if (
            mergedOptions.includeCss &&
            bundle.type === "asset" &&
            cssFilter(bundle.fileName)
          ) {
            additionalStylesheets.push(path);
          }
        }

        additionalModules = additionalModules.sort((a, z) =>
          a.localeCompare(z)
        );

        additionalStylesheets = additionalStylesheets.sort((a, z) =>
          a.localeCompare(z)
        );

        if (mergedOptions.mode === "preload") {
          for (const additionalModule of additionalModules) {
            const element = createModulePreloadLinkElement(
              dom,
              additionalModule
            );
            appendToDom(dom, element);
          }

          for (const additionalStylesheet of additionalStylesheets) {
            const element = createStylesheetLinkElement(
              dom,
              additionalStylesheet
            );
            appendToDom(dom, element);
          }
        } else if (mergedOptions.mode === "prefetch") {
          for (const additionalModule of additionalModules) {
            const element = createPrefetchLinkElement(dom, additionalModule);
            appendToDom(dom, element);
          }

          for (const additionalStylesheet of additionalStylesheets) {
            const element = createPrefetchLinkElement(
              dom,
              additionalStylesheet
            );
            appendToDom(dom, element);
          }
        } else {
          throw new Error(`Unsupported "mode" option: ${mergedOptions.mode}`);
        }
        const unformattedHtml = dom.serialize();

        if (mergedOptions.format === false) {
          return unformattedHtml;
        }

        return prettier.format(unformattedHtml, {
          ...(typeof mergedOptions.format === "object"
            ? mergedOptions.format
            : {}),
          parser: "html",
        });
      },
    },
  };
}
