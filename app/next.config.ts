import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'host.docker.internal',
        port: '9000',
        pathname: `/${process.env.MINIO_BUCKET_NAME}/**`,
      },
    ],
  },
};

export default nextConfig;
