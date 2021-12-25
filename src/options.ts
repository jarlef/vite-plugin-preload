export interface PreloadOptions {
  htmlFile: string;
  includeJs: boolean;
  includeCss: boolean;
}

export const defaultOptions: PreloadOptions = {
  htmlFile: "index.html",
  includeJs: true,
  includeCss: true,
};
