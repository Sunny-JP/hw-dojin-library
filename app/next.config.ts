import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'host.docker.internal',
        port: '9000',
        pathname: `/${process.env.S3_BUCKET_NAME || 'doujinshi-thumbnails'}/**`,
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: (process.env.SERVER_ACTION_BODY_LIMIT || '1mb') as any,
    },
  },
};

export default nextConfig;
