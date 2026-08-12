import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @napi-rs/canvas ships a native (.node) binary. It must stay external to
  // the server bundle rather than be processed by the bundler.
  serverExternalPackages: ["@napi-rs/canvas"],
};

export default nextConfig;
