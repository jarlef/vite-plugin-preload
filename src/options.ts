import type { Options as PrettierOptions } from "prettier";

export interface PreloadOptions {
  /**
   * @default true
   */
  includeJs: boolean;
  /**
   * @default true
   */
  includeCss: boolean;
  /**
   * @default true
   */
  format?: boolean | Omit<PrettierOptions, "parser">;
}

export const defaultOptions: PreloadOptions = {
  includeJs: true,
  includeCss: true,
  format: true,
};
