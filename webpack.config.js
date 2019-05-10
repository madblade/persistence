const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');

module.exports =
{
    entry: './src/index.js',

    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        new webpack.HotModuleReplacementPlugin()
    ],

    output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: '../models/',
        filename: '[name].[hash].js'
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.glsl$/,
                use: 'raw-loader'
            },
            {
                test: /\.json$/,
                use: [{
                        loader: 'file-loader',
                        options: {},
                    }]
            }
        ]
    },

    devtool: 'inline-source-map',

    devServer: {
        contentBase: 'http://localhost:9000/dist',
        port: 9000,
        hot: true,
        disableHostCheck: true
    },

    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        }
    }

};
