import fs from "fs";

describe("vite - build", () => {
  test("html contain preload links", async () => {
    const htmlFile = "examples/react-demo/dist/index.html";

    expect(fs.existsSync(htmlFile));
    const htmlContent = fs.readFileSync(htmlFile, {
      encoding: "utf8",
      flag: "r",
    });

    expect(htmlContent).toMatchSnapshot("index_with_preloads");
  });
});
