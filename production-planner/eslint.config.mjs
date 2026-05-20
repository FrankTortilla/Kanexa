import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  { ignores: ["**/._*"] },
  ...nextVitals,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;
