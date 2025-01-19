import type { Options as PrettierOptions } from "prettier";
import type { OutputChunk, OutputAsset } from "rollup";

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
  /**
   * @default modulepreload
   */
  mode?: 'preload' | 'prefetch';
  /**
   * @default () => true
   */
  shouldPreload: (chunkInfo: OutputChunk | OutputAsset) => boolean;
  /**
   * @default undefined
   */
  generatePreloadManifestJsonPath?: string
}

export const defaultOptions: PreloadOptions = {
  includeJs: true,
  includeCss: true,
  format: true,
  mode: 'preload',
  shouldPreload: () => true
};
