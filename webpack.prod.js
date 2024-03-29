const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

// https://webpack.js.org/guides/production/

module.exports = merge(common, {
    mode: 'production',

});