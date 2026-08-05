import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "public/**"],
  },
  ...coreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Flags the standard fetch-on-mount `load()` pattern used deliberately
      // across every admin page (data fetch + setState on mount). Not a bug.
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;
