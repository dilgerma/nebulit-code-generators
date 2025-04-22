/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

/** @type {import('next').NextConfig} */
// next.configjs
// export default {
//     webpack: (config, {webpack}) => {
//         // config.plugins.push(new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
//         //   resource.request = resource.request.replace(/^node:/, '');
//         // }));
//         // config.plugins.push(
//         //      new webpack.NormalModuleReplacementPlugin(
//         //        /^node:(.*)/,
//         //        function (resource) {
//         //          resource.request = resource.request.replace(/^node:assert/, '');
//         //        }
//         //      )
//         //    );
//         // Exclude spec.ts files from the webpack bundling process
//         config.module.rules.push({
//             test: /node:test/,
//             use: {loader: 'ignore-loader'},
//         });
//         config.module.rules.push({
//             test: /node:assert/,
//             use: {loader: 'ignore-loader'},
//         });
//         config.module.rules.push({
//             test: /node:fs/,
//             use: {loader: 'ignore-loader'},
//         });
//
//         return config;
//     },
// };
module.exports = {
    reactStrictMode: true,
    swcMinify: true,

    webpack: (config, {isServer, webpack}) => {
        config.plugins.push(new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
            resource.request = resource.request.replace(/^node:/, '');
            // resource.request = resource.request.replace(/^crypto/, 'crypto-browserify');

            // resource.request = resource.request.replace(/^crypto/, "crypto-randomuuid");
        }));

        if (!isServer) {
            config.resolve.fallback = {
                "assert": false,
                "test": false,
                "fs": false,
                 "node:crypto": require.resolve('polyfill-crypto-methods')
            };

            config.resolve.alias = {
                  ...config.resolve.alias,
                  crypto: 'polyfill-crypto-methodsd'
            };

        }

        return config;
    },
};

