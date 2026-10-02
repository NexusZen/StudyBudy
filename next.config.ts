import type { NextConfig } from "next";
const config: NextConfig = {
  serverExternalPackages: ["pdf-parse", "sql.js"],
  poweredByHeader: false,
};
export default config;
