module.exports = {
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "core", "node"],
  modulePathIgnorePatterns: ["dist"],
  testEnvironment: "node",
  testTimeout: 30000,
  setupFilesAfterEnv: ['./jest.setup.ts'],
  testRegex: "(/specs/.*|(\\.|/)spec)\\.ts?$",
  transform: {
    "^.+\\.(t|j)s$": "@swc/jest",
  },
};
