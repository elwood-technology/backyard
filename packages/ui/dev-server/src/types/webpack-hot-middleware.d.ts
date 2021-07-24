declare module 'webpack-hot-middleware' {
  import { NextHandleFunction } from 'connect';
  import * as webpack from 'webpack';

  type Options = {
    reload?: boolean;
    heartbeat?: number;
  };

  function WebpackHotMiddleware(
    compiler: webpack.Compiler,
    options?: Options,
  ): NextHandleFunction;

  export = WebpackHotMiddleware;
}
