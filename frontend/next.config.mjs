/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Keep puppeteer out of the server bundle
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
      // @todo: remove picsum pattern before production build
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
      },
      {
        protocol: "https",
        hostname: "img-c.udemycdn.com",
        port: "",
      },
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
      {
        protocol: "https",
        hostname:
          "ehilal-strapi-aws-s3-images-bucket.s3.eu-central-1.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
  staticPageGenerationTimeout: 300,
};

export default nextConfig;
