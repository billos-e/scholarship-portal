import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Allow up to ~30 MB so a submission with three uploads (invoice,
      // transcript, QR) at the 10 MB-per-file cap still fits.
      bodySizeLimit: "30mb",
    },
  },
};

export default nextConfig;
