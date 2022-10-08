import fs from "fs";

const getFiles = (path, extension) => {
  const files = fs.readdirSync(path);
  return files.filter((file) =>
    file.match(new RegExp(`.*\.(${extension})`, "ig"))
  );
};

describe("vite - build", () => {
  test("html contain preload links", async () => {
    const dist = "examples/react-demo/dist";
    const htmlFile = `${dist}/index.html`;
    const assetsDirectory = `${dist}/assets`;

    expect(fs.existsSync(htmlFile));
    expect(fs.existsSync(assetsDirectory));

    const htmlContent = fs.readFileSync(htmlFile, {
      encoding: "utf8",
      flag: "r",
    });

    const jsChunks = getFiles(assetsDirectory, "js");
    expect(jsChunks.length).toBeGreaterThan(0);
    for (const jsChunk of jsChunks) {
      expect(htmlContent).toContain(`"/assets/${jsChunk}"`);
    }

    const cssChunks = getFiles(assetsDirectory, "css");
    expect(cssChunks.length).toBeGreaterThan(0);
    for (const cssChunk of cssChunks) {
      expect(htmlContent).toContain(
        `<link rel="stylesheet" href="/assets/${cssChunk}" />`
      );
    }
  });
});
