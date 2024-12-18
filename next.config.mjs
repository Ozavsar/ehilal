/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Puppeteer modüllerini Webpack'in dışında tut
      config.externals = [
        ...config.externals,
        "puppeteer",
        "puppeteer-extra",
        "puppeteer-extra-plugin-stealth",
      ];
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "miro.medium.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        port: "",
      },
    ],
  },
  staticPageGenerationTimeout: 120,
};

export default nextConfig;
