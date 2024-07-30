import { JSDOM } from "jsdom";
import { normalize } from "path";
export const createDom = (source: string | Uint8Array): JSDOM =>
  new JSDOM(source);

export const createModulePreloadLinkElement = (dom: JSDOM, path: string) => {
  const link = dom.window.document.createElement("link");
  link.rel = "modulepreload";
  link.href = path;
  return link;
};

export const createPrefetchLinkElement = (dom: JSDOM, path: string) => {
  const link = dom.window.document.createElement("link");
  link.rel = "prefetch";
  link.href = path;
  return link;
};

export const createStylesheetLinkElement = (dom: JSDOM, path: string) => {
  const link = dom.window.document.createElement("link");
  link.rel = "stylesheet";
  link.href = path;
  return link;
};

export const getExistingLinks = (dom: JSDOM): string[] => {
  const existingLinks: string[] = [];

  dom.window.document
    .querySelectorAll<HTMLScriptElement>("script")
    .forEach((s) => {
      if (!s.src) {
        return;
      }
      existingLinks.push(s.src);
    });

  dom.window.document
    .querySelectorAll<HTMLLinkElement>("link")
    .forEach((l) => existingLinks.push(normalize(l.href)));

  return existingLinks;
};

export const appendToDom = (dom: JSDOM, link: HTMLElement) =>
  dom.window.document.head.appendChild(link);
