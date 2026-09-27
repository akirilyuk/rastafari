import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev assets are blocked unless the browser origin matches the dev host.
  // Quick tunnels use a new *.trycloudflare.com host each time.
  allowedDevOrigins: ["*.trycloudflare.com"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
