import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: false,
  /* config options here */
  images: {
    domains: [
      'bubblog.s3.amazonaws.com',
      "bucketname.s3.amazonaws.com"
    ],
  },
};

export default nextConfig;
