// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;

import { fileURLToPath } from 'url';
import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
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
