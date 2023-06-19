import { defaultOptions, PreloadOptions } from "./options";
import { createFilter } from "@rollup/pluginutils";
import { Plugin, ResolvedConfig } from "vite";
import {
  appendToDom,
  createDom,
  createModulePreloadLinkElement,
  createStylesheetLinkElement,
  getExistingLinks,
} from "./dom-utils";
import prettier from "prettier";
import { resolve } from "url";

const jsFilter = createFilter(["**/*-*.js"]);
const cssFilter = createFilter(["**/*-*.css"]);

export default function VitePluginPreloadAll(
  options?: Partial<PreloadOptions>
): Plugin {
  let viteConfig: ResolvedConfig;
  const mergedOptions = { ...defaultOptions, ...options };

  return {
    name: "vite:vite-plugin-preload",
    enforce: "post",
    apply: "build",
    configResolved(config) {
      viteConfig = config;
    },
    transformIndexHtml: {
      enforce: "post",
      transform: (html, ctx) => {
        if (!ctx.bundle) {
          return html;
        }

        const base = viteConfig.base ?? "";
        const dom = createDom(html);
        const existingLinks = getExistingLinks(dom);
        let additionalModules: string[] = [];
        let additionalStylesheets: string[] = [];

        for (const bundle of Object.values(ctx.bundle)) {
          const path = resolve(base, bundle.fileName);

          if (existingLinks.includes(path)) {
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

        for (const additionalModule of additionalModules) {
          const element = createModulePreloadLinkElement(dom, additionalModule);
          appendToDom(dom, element);
        }

        for (const additionalStylesheet of additionalStylesheets) {
          const element = createStylesheetLinkElement(
            dom,
            additionalStylesheet
          );
          appendToDom(dom, element);
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
