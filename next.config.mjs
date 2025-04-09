import { fileURLToPath } from 'url';

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'i.pravatar.cc',
                pathname: '**',
            }
        ],
    },

    reactStrictMode: true, // Enable strict mode for React

    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Prevent client-side bundling of certain Node.js modules
            config.resolve.fallback = {
                fs: false,
                net: false,
                tls: false,
            };
        }

        // Get the current file path for cache invalidation
        const __filename = fileURLToPath(import.meta.url);
        config.cache = {
            type: 'filesystem', // Use filesystem cache
            buildDependencies: {
                config: [__filename], // Rebuild cache when config file changes
            },
        };

        return config;
    },
};

export default nextConfig;