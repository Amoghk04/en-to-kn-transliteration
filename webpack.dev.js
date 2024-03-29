const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');


// https://stackoverflow.com/questions/67289563/how-do-i-get-readable-javascript-files-in-the-development-mode-of-webpack

module.exports = merge(common, {
    mode: 'development',
    devtool: 'eval-source-map',
    watchOptions: {
        aggregateTimeout: 200,
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        devMiddleware: {
            writeToDisk: true
        },
        port: 3000,
    },
});