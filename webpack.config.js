const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const globule = require("globule");
const fs = require("fs");

let mode = 'development'
if (process.env.NODE_ENV === 'production') {
    mode = 'production'
}

const mixins = globule
    .find(["src/blocks/libs/**/_*.pug", "!src/blocks/libs/_libs.pug"])
    .map((path) => path.split('/').pop())
    .reduce((acc, currentItem) => acc + `include ${currentItem}\n`, ``);

fs.writeFile("src/blocks/libs/_libs.pug", mixins, (err) => {
    if (err) throw err;
    console.log("Mixins are generated automatically!");
});

const paths = globule.find(["src/pug/pages/**/*.pug"]);

module.exports = {
    mode: mode,
    output: {
        filename: '[name].[contenthash].js',
        assetModuleFilename: "assets/[hash][ext][query]",
        clean: true,
    },
    devServer: {
        open: true,
        static: {
            directory: './src',
            watch: true
        }
    },
    devtool: 'source-map',
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css'
        }),
        // new HtmlWebpackPlugin({
        //     template: "./src/pug/pages/index.pug",
        //     filename: "index.html"
        // }),
        // new HtmlWebpackPlugin({
        //     template: "./src/pug/pages/categories.pug",
        //     filename: "categories.html"
        // })
        ...paths.map((path) => {
            return new HtmlWebpackPlugin({
                template: path,
                filename: `${path.split(/\/|.pug/).splice(-2, 1)}.html`,
            });
        })],
    module: {
        rules: [
            {
            test: /\.html$/i,
            loader: "html-loader",
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    (mode === 'development') ? "style-loader" : MiniCssExtractPlugin.loader,
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [
                                    [
                                        "postcss-preset-env",
                                        {
                                            // Options
                                        },
                                    ],
                                ],
                            },
                        },
                    },
                    "sass-loader",
                ],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.pug$/,
                loader: 'pug-loader',
                exclude: /(node_modules|bower_components)/,
            },
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    // options: {
                    //     presets: ['@babel/preset-env']
                    // }
                }
            }
        ]
    },
}