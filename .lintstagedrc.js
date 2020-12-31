module.exports = {
  "src/**/*.{js,jsx,ts,tsx,json,md}": [
    "eslint --max-warnings 0",
    "prettier --write"
  ],
  "**/*.ts?(x)": [() => "tsc -p tsconfig.json --noEmit"]
};
