const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development', // 開発モード (production にすると最適化される)
  entry: './src/index.ts', // エントリーポイント (最初に読み込まれるファイル)
  output: {
    path: path.resolve(__dirname, 'dist'), // 出力先ディレクトリ
    filename: 'bundle.js', // 出力ファイル名
  },
  module: {
    rules: [
      {
        test: /\.ts$/, // .ts ファイルを対象とする
        use: 'ts-loader', // ts-loader で処理する
        exclude: /node_modules/, // node_modules ディレクトリは除外
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'], // .ts, .js ファイルを解決する
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html', // テンプレートとなる HTML ファイル
    }),
    new HtmlWebpackPlugin({
      filename: 'deAssemble.html',
      template: './src/deAssemble.html', // テンプレートとなる HTML ファイル
    }),
  ],
  devServer: {
    static: {
        directory: path.join(__dirname, "dist")
    },
    open: true,        // サーバー起動時にブラウザを自動的に開く
    port: 8080,       // サーバーのポート番号
  },
};