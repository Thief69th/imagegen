/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false, path: false };
    if (!isServer) {
      config.externals = [...(config.externals ?? []), "sharp"];
    }
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
      { protocol: "https", hostname: "**.facebook.com" },
      { protocol: "https", hostname: "**.pinimg.com" },
      { protocol: "https", hostname: "**.pinterest.com" },
      { protocol: "https", hostname: "i.pinimg.com" },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["sharp"],
  },
};
export default nextConfig;
