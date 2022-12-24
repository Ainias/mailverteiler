const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const nextTranslate = require('next-translate');

/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS, PUT, PATCH, DELETE' },
                    { key: 'Access-Control-Allow-Headers', value: 'X-Requested-With,content-type,Authorization' },
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                ],
            },
        ];
    },
    crossOrigin: 'anonymous',
    reactStrictMode: true,
    images: {
        loader: 'akamai',
        path: '',
    },
    webpack: (config, { isServer, webpack }) => {
        if (!isServer) {
            config.plugins.push(
                new webpack.NormalModuleReplacementPlugin(/typeorm$/, function (result) {
                    result.request = result.request.replace(/typeorm/, 'typeorm/browser');
                }),
                new CopyWebpackPlugin({
                    patterns: [
                        {
                            from: path.resolve(__dirname, 'node_modules/sql.js/dist/sql-wasm.wasm'),
                            to: path.resolve(__dirname, 'public/'),
                        },
                        {
                            from: path.resolve(__dirname, 'node_modules/localforage/dist/localforage.js'),
                            to: path.resolve(__dirname, 'public/'),
                        },
                    ],
                })
            );
            config.resolve.fallback = { fs: false, process: false, path: false, crypto: false };
        }
        config.plugins.push(
            new webpack.IgnorePlugin({
                resourceRegExp: /~$/,
            })
        );
        return config;
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    poweredByHeader: false,
    experimental: {
        workerThreads: false,
        cpus: 1
    },
};

module.exports = nextTranslate(nextConfig);
