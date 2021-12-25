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
  let resolvedConfig: ResolvedConfig;
  const resolvedOptions = { ...defaultOptions, ...options };

  return {
    name: "vite:preload-all",
    enforce: "post",
    configResolved(config) {
      resolvedConfig = config;
    },
    async generateBundle(_, outBundle) {
      const htmlFile = outBundle[resolvedOptions.htmlFile];

      if (!htmlFile || htmlFile.type != "asset") {
        return;
      }

      const dom = createDom(htmlFile.source);
      const existingLinks = getExistingLinks(dom);

      for (const bundle of Object.values(outBundle)) {
        const path = `${resolvedConfig.server.base ?? ""}/${bundle.fileName}`;

        if (existingLinks.includes(path)) {
          continue;
        }

        if (
          resolvedOptions.includeJs &&
          bundle.type === "chunk" &&
          jsFilter(bundle.fileName)
        ) {
          const link = createModulePreloadLinkElement(dom, path);
          appendToDom(dom, link);
        }

        if (
          resolvedOptions.includeCss &&
          bundle.type === "asset" &&
          cssFilter(bundle.fileName)
        ) {
          const link = createStylesheetLinkElement(dom, path);
          appendToDom(dom, link);
        }
      }

      htmlFile.source = prettier.format(dom.serialize(), { parser: "html" });
    },
  };
}
