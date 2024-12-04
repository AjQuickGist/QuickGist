const path = require('path');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require("copy-webpack-plugin");

const SveltePreprocess = require('svelte-preprocess');

module.exports = {
    watch: true,
    entry: {
        'content/content': ['./src/content/content.ts'],
        'content/ctrlframe': ['./src/content/ctrlframe.ts'],
        'popup/popup': ['./src/toolbar/popup.ts'],
        'service_worker/service_worker': ['./src/service_worker/service_worker.ts']
    },
    resolve: {
        extensions: ['.mjs', '.js', '.svelte', '.ts'],
        mainFields: ['svelte', 'browser', 'module', 'main'],
        conditionNames: ['svelte', 'browser']
    },
    output: {
        path: path.join(__dirname, '/dist'),
        filename: '[name].js',
        chunkFilename: '[name].[id].js'
    },
    module: {
        rules: [
            {
                test: /\.svelte$/,
                use: {
                    loader: 'svelte-loader',
                    options: {
                        preprocess: SveltePreprocess(),
                        compilerOptions: {
                            dev: true,
                        },
                        emitCss: false,
                        hotReload: true
                    }
                }
            },
            {
                test: /\.svelte\.ts$/,
                use: [ "svelte-loader", "ts-loader"],
            },
            // This is the config for other .ts files - the regex makes sure to not process .svelte.ts files twice
            {
                test: /(?<!\.svelte)\.ts$/,
                loader: "ts-loader",
            },

            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            }
        ]
    },
    mode: 'production',
    optimization: {
        minimize: true
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css'
        }),
        new CopyPlugin({
            patterns: [{from: ".", to: ".", context: "public"}]
        }),
    ],
    devtool: 'source-map',
    devServer: {
        hot: true,
        static: {
            directory: path.join(__dirname, 'dist'),
        }
    }
};