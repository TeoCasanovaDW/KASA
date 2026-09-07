import type { NextConfig } from "next";

// Read directly rather than through `getApiUrl()`: the config is evaluated at
// build time, where a missing variable must not throw.
const apiBase = process.env.KASA_API_URL?.trim().replace(/\/+$/, "");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3-eu-west-1.amazonaws.com",
        pathname: "/course.oc-static.com/projects/front-end-kasa-project/**",
      },
    ],
  },
  experimental: {
    // 1 cover + 6 pictures at 10 MB each = 70 MB, plus multipart overhead:
    // see `## Request size budget` in specs/09-property-creation.md.
    // Next's default is 1 MB, which every real submit would exceed.
    serverActions: {
      bodySizeLimit: "80mb",
    },
  },
  // Uploaded images are served by the API; this makes them resolve as
  // same-origin `/uploads/...` paths, so no remote pattern is needed.
  async rewrites() {
    if (!apiBase) {
      return [];
    }

    return [
      {
        source: "/uploads/:path*",
        destination: `${apiBase}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
