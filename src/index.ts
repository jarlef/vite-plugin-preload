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

const jsFilter = createFilter(["**/*.*.js"]);
const cssFilter = createFilter(["**/*.*.css"]);

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

        const dom = createDom(html);
        const existingLinks = getExistingLinks(dom);

        for (const bundle of Object.values(ctx.bundle)) {
          const path = `${viteConfig.server.base ?? ""}/${bundle.fileName}`;

          if (existingLinks.includes(path)) {
            continue;
          }

          if (
            mergedOptions.includeJs &&
            bundle.type === "chunk" &&
            jsFilter(bundle.fileName)
          ) {
            const link = createModulePreloadLinkElement(dom, path);
            appendToDom(dom, link);
          }

          if (
            mergedOptions.includeCss &&
            bundle.type === "asset" &&
            cssFilter(bundle.fileName)
          ) {
            const link = createStylesheetLinkElement(dom, path);
            appendToDom(dom, link);
          }
        }

        return prettier.format(dom.serialize(), { parser: "html" });
      },
    },
  };
}
