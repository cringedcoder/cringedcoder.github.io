let webpack = require('webpack');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
let path = require('path');
let sane = require('sane');
let chalk = require('chalk');
let debounce = require('throttle-debounce/debounce');
let scssToJson = require('scss-to-json');
let logger = require('./logger.js');

let webpackCompiler = null;
let sources = null;
let results = null;
let scssVariablesPath = null;

function baseConfig(dev, config) {
    sources = path.resolve(__dirname, config.paths.root, config.paths.sources);
    results = path.resolve(__dirname, config.paths.root, config.paths.temp);
    
    scssVariablesPath = config.webpack.scssToJson
        ? path.resolve(
            sources, 
            config.dirs.sass,
            config.webpack.scssToJson)
        : null;

    let base = {
        entry: path.resolve(
            sources,
            config.dirs.js,
            config.files.scriptsSource
        ),
        output: {
            path: path.resolve(
                results,
                config.dirs.js
            ),
            filename: dev || !config.files.scriptsResultsMin
                ? config.files.scriptsResults
                : config.files.scriptsResultsMin,
            chunkFilename: config.webpack.scriptsResultChunk
        },
        cache: dev,
        devtool: 'source-map',
        externals: {},
        resolve: {
            alias: {
                sources: path.resolve(
                    sources
                )
            }
        },
        plugins: [
            new webpack.ProvidePlugin({
              $: 'jquery',
              jQuery: 'jquery',
              Popper: 'sources/js/vendors/popper.js'
            })
        ].concat(dev ? [
            // Developement plugins
        ] : [
            // Production plugins
            new webpack.optimize.UglifyJsPlugin({minimize: true})
        ]),
        module: {
          rules: [
            {
              test: /\.js$/,
              exclude: /(node_modules|bower_components|js\/vendors)/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: [[
                    'env',
                    {
                        targets: {
                            browsers: ['last 2 versions', 'ie >= 10', 'safari >= 9']
                        },
                        useBuiltIns: true,
                        debug: false
                    }
                  ]],
                  plugins: [
                      'syntax-dynamic-import',
                      'transform-runtime'
                  ],
                  cacheDirectory: true
                }
              }
            }
          ]
        }
    };

    return base;
}

function generateConfig(dev, config) {
    let webpackConfig = baseConfig(dev, config);

    if(config.webpack.scssToJson) {
        webpackConfig.externals.scss = 
            JSON.stringify(scssToJson(scssVariablesPath));
    }

    Object.assign(webpackConfig, config.webpack.override);

    return webpackConfig;
}

function build(dev, config) {
    return new Promise((resolve, reject) => {
        if (!dev || !webpackCompiler) {
            webpackCompiler = webpack(generateConfig(dev, config));
        }

        webpackCompiler.run(function(err, stats) {
            log(err, stats, resolve, reject);
        });
    });
}

function watch(dev, config, callback) {
    let watcherJs = sane(sources, {glob: '**/*.js'});
    let debounced = debounce(300, () => {
      build(dev, config).then(callback);
    });

    watcherJs.on('change', debounced);
    watcherJs.on('add', debounced);
    watcherJs.on('delete', debounced);

    if(scssVariablesPath) {
        let watcherScssVariables = sane(scssVariablesPath);
        let resetted = debounce(300, () => {
            webpackCompiler = null;
            build(dev, config);
        });
        watcherScssVariables.on('change', resetted);
        watcherScssVariables.on('add', resetted);
        watcherScssVariables.on('delete', resetted);
    }
}

function log(err, stats, resolve, reject) {
    logger.log(chalk.green('[webpack]'));
    if (err) {
        logger.error('Webpack build [ERROR]');
        reject(new Error('webpack', err));
    }
    logger.log(stats.toString({
        assets: true,
        colors: true,
        chunks: false,
        chunkModules: false,
        modules: false,
        children: false,
        cached: false,
        reasons: false,
        source: false,
        errorDetails: false,
        chunkOrigins: false,
        modulesSort: false,
        chunksSort: false,
        assetsSort: false,
        warnings: true/*,
         exclude: ['core-js', 'babel-runtime', 'babel-polyfill', 'babel-regenerator-runtime']*/
    }));
    logger.success('Webpack build [SUCCESS]');
    resolve();
}

module.exports = {
    build: build,
    watch: watch
};


// let path = require('path');
// let scssToJson = require('scss-to-json');
// let chalk = require('chalk');
// let webpack = require('webpack');
// let CleanWebpackPlugin = require('clean-webpack-plugin');
// let BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// let CompressionPlugin = require('compression-webpack-plugin');
// let SvgStore = require('webpack-svgstore-plugin');
// let CleanObsoleteChunks = require('webpack-clean-obsolete-chunks');
// let config = require('./config.json');
// let getFilename = require('./getFilename');
// let sourcesDir = config.paths.root + config.paths.sources;
// let distDir = sourcesDir + config.paths.temp;
// let entryJs = sourcesDir + config.dirs.js + config.files.scriptsSource;
// let outputDir = distDir + config.dirs.js;
// let resultsDir = config.paths.root + config.paths.results + config.dirs.js;
// let outputJsFilename = config.files.scriptsResults;
// let outputChunkname = '[name].[chunkhash].chunk.js';
// let scssVariablesPath = path.resolve(__dirname, sourcesDir + config.dirs.sass + 'utils/_variables.scss');
// let webPackDevCompilers = null;

// function generateConfig(isProduction) {
//     let baseConfig = {
//         devtool: 'source-map',
//         cache: !isProduction,
//         externals: {
//             scss: JSON.stringify(scssToJson(scssVariablesPath)),
//             trans: 'window.j4p.trans',
//             config: 'window.j4p.config'
//         },
//         node: {
//             fs: 'empty'
//         },
//         resolve: {
//             //modulesDirectories: [path.resolve('node_modules')]
//             alias: {
//                 sources: path.resolve(sourcesDir)
//             }
//         },
//             /*
//          resolveLoader: {
//          modulesDirectories: [path.resolve('node_modules')]
//          },*/
//         // Czasem wywala builda :)
//         // Problem lezy zapisie/odczycie pliku
//         // Powstały bufor jest niepoprawny
//         // Nie stosować!
//         //recordsPath: paths.assetsDir + '/recordsPath.json',
//         watch: false,
//         plugins: [
//             new CleanObsoleteChunks(),
//             new CleanWebpackPlugin([path.resolve(resultsDir)], {
//                 verbose: false,
//                 dry: false,
//                 watch: true,
//                 root: path.join(__dirname, '../')
//             }),
//             new webpack.optimize.OccurrenceOrderPlugin(),
//             new webpack.ProvidePlugin({
//                 $: 'jquery',
//                 jQuery: 'jquery'
//             }),
//             new SvgStore({
//                 // svgo options
//                 svgoOptions: {
//                     plugins: [
//                         { removeTitle: true }
//                     ]
//                 },
//                 prefix: ''
//             })
//         ].concat(isProduction ? [
//             new webpack.optimize.UglifyJsPlugin({
//                 sourceMapFilename: getFilename(outputJsFilename, isProduction) + '.map',
//                 sourceMap: true
//             }),
//             new BundleAnalyzerPlugin({
//                 analyzerMode: 'static',
//                 reportFilename: 'report.html',
//                 openAnalyzer: false
//             }),
//             new CompressionPlugin({
//                 asset: '[path].gz[query]',
//                 algorithm: 'gzip',
//                 test: /\.(js)$/,
//                 threshold: 10240,
//                 minRatio: 0.8
//             })
//         ] : [
//             new webpack.LoaderOptionsPlugin({
//                 debug: true
//             })
//         ]),
//         module: {
//             loaders: [
//                 {
//                     test: /\.mp3$/,
//                     loader: 'url?limit=10000&name=[name]-[hash:4].[ext]'
//                 }, {
//                     test: /\.twig$/,
//                     loader: 'doot-loader?option1=1'
//                 }, {
//                     test: /\.dot$/,
//                     loader: 'dot-loader'
//                 }, {
//                     test: /\.png$/,
//                     loader: 'url?limit=5000&name=[name]-[hash:4].[ext]'
//                 }, {
//                     test: /\.jpg$/,
//                     loader: 'url?limit=5000&name=[name]-[hash:4].[ext]'
//                 }, {
//                     test: /\.gif$/,
//                     loader: 'url?limit=5000&name=[name]-[hash:4].[ext]'
//                 }, {
//                     test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
//                     loader: 'url?limit=5000&name=' + outputDir + 'font/[name]-[hash:4].[ext]'
//                 }, {
//                     test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
//                     loader: 'url?limit=5000&name=' + outputDir + 'font/[name]-[hash:4].[ext]'
//                 }, {
//                     test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
//                     loader: 'file?name=' + outputDir + 'font/[name]-[hash:4].[ext]'
//                 }, {
//                     test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
//                     loader: 'file?name=' + outputDir + 'font/[name]-[hash:4].[ext]'
//                 }, {
//                     test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
//                     loader: 'file?name=' + outputDir + 'font/[name]-[hash:4].[ext]'
//                 }, {
//                     test: /\.jsx?$/,
//                     exclude: /(node_modules|bower_components|js\/vendor)/,
//                     loader: 'babel-loader',
//                     query: {
//                         presets: [[require.resolve('babel-preset-env'), {
//                             targets: {
//                                 browsers: ['last 2 versions', 'ie >= 10', 'safari >= 9']
//                             },
//                             useBuiltIns: true,
//                             debug: false
//                         }]],
//                         plugins: [
//                             'syntax-dynamic-import',
//                             'transform-runtime',
//                             'transform-object-assign',
//                             'transform-async-to-generator'
//                         ],
//                         cacheDirectory: true
//                     }
//                 }, {
//                     test: require.resolve('jquery'),
//                     loader: 'expose-loader?jQuery!expose-loader?$'
//                 }
//             ].concat(isProduction ? [
//                 {
//                     test: /\.jsx?$/,
//                     loader: 'webpack-strip?strip[]=debug,strip[]=console.log'
//                 }, {
//                     test: /\.jsx?$/, /* develblock:start */ /* develblock:end */
//                     loader: 'webpack-strip-block'
//                 }
//             ] : [])
//         }
//     };
//     return [
//         Object.assign({}, baseConfig, {
//             name: 'main',
//             entry: [
//                 'core-js/fn/promise',
//                 path.resolve(entryJs)
//             ],
//             output: {
//                 path: path.resolve(outputDir),
//                 filename: getFilename(outputJsFilename, isProduction),
//                 chunkFilename: outputChunkname,
//                 publicPath: '/k2/j4p/js/'
//             }
//         })
//     ];
// }
// function logWebPack(err, stats, resolve, reject) {
//     util.log(chalk.green('[webpack]'));
//     if (err) {
//         reject(new util.PluginError('webpack', err));
//     }
//     util.log(stats.toString({
//         assets: true,
//         colors: true,
//         chunks: false,
//         chunkModules: false,
//         modules: false,
//         children: false,
//         cached: false,
//         reasons: false,
//         source: false,
//         errorDetails: false,
//         chunkOrigins: false,
//         modulesSort: false,
//         chunksSort: false,
//         assetsSort: false,
//         warnings: true/*,
//          exclude: ['core-js', 'babel-runtime', 'babel-polyfill', 'babel-regenerator-runtime']*/
//     }));
//     resolve();
// }
// function webpackTask(isProduction) {
//     let promises = [];
//     if (isProduction || !webPackDevCompilers) {
//         let configs = generateConfig(isProduction);
//         webPackDevCompilers = [];
//         for (let i = 0, cLen = configs.length; i < cLen; i++) {
//             webPackDevCompilers.push(webpack(configs[i]));
//         }
//     }
//     for (let i = 0, cLen = webPackDevCompilers.length; i < cLen; i++) {
//         promises.push(new Promise((resolve, reject) => {
//             webPackDevCompilers[i].run(function(err, stats) {
//                 logWebPack(err, stats, resolve, reject);
//             });
//         }));
//     }
//     return Promise.all(promises);
// }
// module.exports = webpackTask;
