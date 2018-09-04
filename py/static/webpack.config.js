const path = require('path');

const index = {
    entry: './js/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                use: [
                    'html-loader'
                ]
            }
        ]
    }
};

const plot = {
    entry: './js/plot.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'plot.js',
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                use: [
                    'html-loader'
                ]
            }
        ]
    }
};

module.exports = [index, plot];