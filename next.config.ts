import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    skipWaiting: true,
  },
});

const nextConfig: NextConfig = {
  /* config options here */
  // reactCompiler: true, // 暂时禁用，等待 React Compiler 稳定版
};

export default withPWA(nextConfig);
