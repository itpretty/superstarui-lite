require('es6-promise');
require('babel-polyfill');
require('console-polyfill');
const webpack = require('webpack');
var path=require("path");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var postcssImport = require('postcss-import');

module.exports={
  <!--  要打包的文件 -->
  entry:"./js/index.js",

  output:{
    <!-- 指定打包后的文件名字 -->
    filename:"./ssui.min.js",
    <!-- 打包后的文件路径 -->
    path:path.resolve(__dirname,"dist"),
    libraryTarget: 'var'
  },
  
  resolve: {
    //extensions: ['', '.js', '.es6', '.vue'],
    alias: {
        es5Shim: '../node_modules/es5-shim/es5-shim.js',
        es5Sham: '../node_modules/es5-shim/es5-sham.js',
        jqueryui: './jquery-ui.min.js',
        vue: './vue.js',
        //vue: './vue.esm.js',
        iview: './iview.min.js',
        ztree: './jquery.ztree.all.min.js',
        base: './base.js'
    }
  },
  
  module:{
    rules:[   
      {
        test: /\.(le|c)ss$/,
        use: ExtractTextPlugin.extract({
          use: [
              'css-loader', 
              'less-loader', 
              {
                  loader: 'postcss-loader', 
                  options: {
                    plugins: (loader) => [
                        postcssImport({root: loader.resourcePath}),
                        //autoprefixer(), //CSS浏览器兼容
                        //cssnano()  //压缩css
                    ]
                  }
              }
          ]
        })
      },
      {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          loader: 'url-loader',
          query: {
              limit: 15000,
              <!-- 小于15k的转化为Base64 -->
              name: '[name].[hash:7].[ext]'
          }
      },
      {
          //test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          test: /\.(ttf)(\?.*)?$/,
          loader: 'url-loader',
          query: {
              limit: 200000,
              name: 'font/[name].[hash:7].[ext]'
          }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
            loader: 'babel-loader',
            options: {
                presets: ['es2015'],
                plugins: ['transform-runtime']
            }            
        }
      },
      {
          test: require.resolve('jquery'),
          use: [{
              loader: 'expose-loader',
              options: 'jQuery'
          },{
              loader: 'expose-loader',
              options: '$'
          }]
      },
      // 兼容旧版本 IE
      {
          test: /\.js$/,
          enforce: 'post', // post-loader处理
          loader: 'es3ify-loader'
      }
    ]
  },
  
  plugins: [
    /**/
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    /*
    new HtmlWebpackPlugin({
      hash: true,
      <!-- script 插入到 head -->
      //inject:'head',
      title: "测试 HtmlWebpackPlugin",
      <!-- 指定模板位置 -->
      template:'./src/index.html',
      <!-- 指定打包后的文件名字 -->
      filename: 'index.html'      
    }),
    */
    <!-- 每次打包前先删除dist目录 -->
    new CleanWebpackPlugin(['dist']),
    new ExtractTextPlugin('./ssui.min.css'),
    
    // 压缩 js    
    new webpack.optimize.UglifyJsPlugin({
      // 兼容旧版本 IE
      /*
      compress: {
        properties: false,
        warnings: false
      },
      output: {
          beautify: true,
          quote_keys: true
      },
      mangle: {
        screw_ie8: false
      },
      sourceMap: false
      */
    })
  ]
}
