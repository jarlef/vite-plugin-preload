import { createFilter } from "@rollup/pluginutils";
import { Plugin, ResolvedConfig } from "vite";
import {
  appendToDom,
  createDom,
  createModulePreloadLinkElement,
  createStylesheetLinkElement,
  getExistingLinks,
} from "./dom-utils";

const jsFilter = createFilter(["**/*.*.js"]);
const cssFilter = createFilter(["**/*.*.css"]);

export default function VitePluginPreloadAll(): Plugin {
  let resolvedConfig: ResolvedConfig;
  return {
    name: "vite:preload-all",
    enforce: "post",
    configResolved(config) {
      resolvedConfig = config;
    },
    async generateBundle(_, outBundle) {
      const indexHtml = outBundle["index.html"];

      if (!indexHtml || indexHtml.type != "asset") {
        return;
      }

      const dom = createDom(indexHtml.source);
      const existingLinks = getExistingLinks(dom);

      for (const bundle of Object.values(outBundle)) {
        const path = `${resolvedConfig.server.base ?? ""}/${bundle.fileName}`;

        if (existingLinks.includes(path)) {
          continue;
        }

        if (bundle.type === "chunk" && jsFilter(bundle.fileName)) {
          const link = createModulePreloadLinkElement(dom, path);
          appendToDom(dom, link);
        }

        if (bundle.type === "asset" && cssFilter(bundle.fileName)) {
          const link = createStylesheetLinkElement(dom, path);
          appendToDom(dom, link);
        }
      }

      indexHtml.source = dom.serialize();
    },
  };
}
