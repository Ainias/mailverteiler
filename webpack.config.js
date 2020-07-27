require("dotenv").config();

const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require('webpack');
const path = require("path");
const WorkboxPlugin = require('workbox-webpack-plugin');

const os = require('os');
const ifaces = os.networkInterfaces();

let mode = (process.env.MODE || "development");
// let mode = "production";

function getIp() {
    let ip = null;
    Object.keys(ifaces).some(function (ifname) {
        return ifaces[ifname].some(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return false;
            }

            ip = iface.address;
            return true;
        });
    });
    return ip;
}

let moduleExports = {

    //Development oder production, wird oben durch Variable angegeben (damit später per IF überprüft)
    mode: mode,

    //Beinhaltet den JS-Startpunkt und SCSS-Startpunkt
    entry: [__dirname + "/src/client/js/script.js", __dirname + "/src/client/sass/index.scss"],
    // devtool: 'inline-source-map',

    //Gibt Ausgabename und Ort für JS-File an
    output: {
        path: path.resolve(__dirname, 'www'),
        filename: 'bundle.js'
    },
    resolve:{
        extensions: [".ts", ".js", ".mjs", ".json", "png"]
    },

    optimization: {
        // minimize: false
        minimizer: [
            new TerserPlugin({
                cache: true,
                parallel: true,
                sourceMap: true, // Must be set to true if using source-maps in production
                terserOptions: {
                    mangle: {
                        reserved: [
                            "Article", "Exercise", "Course", "ExerciseProgress"
                        ]
                    }
                }
            })
        ]
    },

    plugins: [
        //Delete www before every Build (to only have nessesary files)
        new CleanWebpackPlugin({cleanOnceBeforeBuildPatterns: ['**/*', '!**/.gitkeep']}),

        new CopyWebpackPlugin([
            {
                from: path.resolve("./node_modules/sql.js/dist/sql-wasm.js"),
                to: "scripts/"
            },
            {
                from: path.resolve("./node_modules/sql.js/dist/sql-wasm.wasm"),
                to: "sql-wasm.wasm"
            },
            {
                from: path.resolve("./node_modules/localforage/dist/localforage.js"),
                to: "scripts/"
            },
        ]),

        new WorkboxPlugin.GenerateSW({
            maximumFileSizeToCacheInBytes: 1024 * 1024 * 1024 * 5
        }),

        new webpack.NormalModuleReplacementPlugin(/typeorm$/, function (result) {
            result.request = result.request.replace(/typeorm/, "typeorm/browser");
        }),

        //Erstellt (kopiert) die Index.html
        new HtmlWebpackPlugin({
            template: '!!html-loader!src/client/index.html'
        }),
        new webpack.DefinePlugin({
            __HOST_ADDRESS__:  "'" + (process.env.HOST_URI || ((process.env.HOST || ("http://"+getIp())) + ":" + (process.env.REQUEST_PORT || process.env.PORT || "3000") + "/api/v1/")) + "'",
            __SYNCHRONIZE_DB__: mode !== "production"
        }),

        // new webpack.ProvidePlugin({
        //     'window.initSqlJs': path.join(__dirname, 'node_modules/sql.js/dist/sql-asm.js'),
        // }),
    ],

    module: {

        //Regeln: Wenn Regex zutrifft => führe Loader (in UMGEKEHRTER) Reihenfolge aus
        rules: [
            {
                //Kopiert HTML-Dateien in www. Nur die Dateien, welche im JS angefragt werden
                test: /html[\\\/].*\.html$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'html'
                        }
                    },
                    {
                        loader: 'extract-loader'
                    },
                    {
                        loader: 'html-loader',
                        options: {
                            //Sorgt dafür, dass Child-Views funktionieren
                            attrs: [
                                ":data-view",
                                ":src",
                                "link:href"
                            ]
                        }
                    }
                ],
            },
            {
                test: /\.tsx?$/,
                use: "ts-loader",
            },
            {
                //Kopiert nur benutzte Bilder/Videos/Sound (benutzt durch JS (import), html oder css/sass)
                test: /(img|video|sound)[\\\/]/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: (resourcePath, resourceQuery) => {
                                // console.log("path", resourcePath);
                                // console.log("query", resourceQuery);
                                return "[name].[ext]"
                            },
                            outputPath: 'img',
                            publicPath: (url, resourcePath, context) => {
                                // console.log("url: ", url);
                                // console.log("resourcePath: ", resourcePath);
                                // console.log("context: ", context);

                                return "/img/"+url;
                            },
                            // useRelativePath: false
                        }
                    },
                ],
            },
            {
                //Compiliert SASS zu CSS und speichert es in Datei
                test: /\.scss$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].css',
                            outputPath: 'css',
                            // publicPath: '/css'
                        }
                    },
                    {
                        loader: 'extract-loader'
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        //Compiliert zu CSS
                        loader: 'sass-loader'
                    }
                ]
            }
        ]
    }
};

//Auslagerung von zeitintensiven Sachen in production only, damit Debugging schneller geht
if (mode === "production") {

    //Polyfills hinzufügen
    moduleExports["entry"].unshift("@babel/polyfill");
    // moduleExports["devtool"] = "source-map";

    //Transpilieren zu ES5
    moduleExports["module"]["rules"].push({
        test: /\.m?js$/,
        exclude: /node_modules\/(?!(cordova-sites))/,
        use: {
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-env'],
            }
        }
    });

    //Hinzufügen von POSTCSS und Autoprefixer für alte css-Präfixe
    moduleExports["module"]["rules"][2]["use"].splice(3, 0, {
        //PostCSS ist nicht wichtig, autoprefixer schon. Fügt Präfixes hinzu (Bsp.: -webkit), wo diese benötigt werden
        loader: 'postcss-loader',
        options: {
            plugins: [require('autoprefixer')({
                browsers: ['last 2 versions', 'ie >= 9', 'android >= 4.4', 'ios >= 7']
            })]
        }
    });

    moduleExports["optimization"] = {
        minimize: false,
        // minimizer: [new UglifyJsPlugin({
        //     include: /\.min\.js$/
        // })]
    }
}

module.exports = moduleExports;

