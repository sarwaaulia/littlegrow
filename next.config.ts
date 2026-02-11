import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'cqzneedctkjaekkckdjx.supabase.co',
    },
  ],
},
};

export default nextConfig;
