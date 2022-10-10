import fs from "fs";
import { it, describe, expect } from "vitest";
import { JSDOM } from "jsdom";

const dist = "examples/react-demo/dist";
const htmlFile = `${dist}/index.html`;
const assetsDirectory = `${dist}/assets`;

export const getDom = (): JSDOM => {
  const htmlContent = fs.readFileSync(htmlFile, {
    encoding: "utf8",
    flag: "r",
  });

  return new JSDOM(htmlContent);
};

const getFiles = (path, extension) => {
  const files = fs.readdirSync(path);
  return files.filter((file) =>
    file.match(new RegExp(`.*\.(${extension})`, "ig"))
  );
};

describe("vite-plugin-preload", () => {
  it("html asset exists", async () => {
    expect(fs.existsSync(htmlFile));
  });

  it("assets directory exists", async () => {
    expect(fs.existsSync(assetsDirectory));
  });

  it("html contain main js module", async () => {
    const dom = getDom();
    const mainScriptMatch = dom.window.document.querySelector(
      'script[type="module"]'
    );
    expect(mainScriptMatch).toBeTruthy();
    const ref = mainScriptMatch?.getAttribute("src");
    const jsChunks = getFiles(assetsDirectory, "js");
    const jsRefs = jsChunks.map((c) => `/assets/${c}`);
    expect(jsRefs).toContain(ref);
  });

  it("html contains preload js modules", async () => {
    const dom = getDom();
    const scriptPreloads = dom.window.document.querySelectorAll(
      'link[rel="modulepreload"]'
    );

    const scriptRefs = Array.from(scriptPreloads.values()).map((x) =>
      x.getAttribute("href")
    );

    const jsChunks = getFiles(assetsDirectory, "js");
    const jsRefs = jsChunks.map((c) => `/assets/${c}`);

    expect(scriptRefs.length).equals(jsRefs.length - 1);
    scriptRefs.forEach((r) => expect(jsRefs).contains(r));
  });

  it("html contains css references", async () => {
    const dom = getDom();
    const scriptPreloads = dom.window.document.querySelectorAll(
      'link[rel="stylesheet"]'
    );

    const stylesheetRefs = Array.from(scriptPreloads.values()).map((x) =>
      x.getAttribute("href")
    );

    const cssChunks = getFiles(assetsDirectory, "css");
    const cssRefs = cssChunks.map((c) => `/assets/${c}`);

    expect(stylesheetRefs.length).equals(cssRefs.length);
    stylesheetRefs.forEach((r) => expect(cssRefs).contains(r));
  });
});
