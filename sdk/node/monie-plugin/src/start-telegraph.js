// 在项目根目录创建
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    target: 'es2020'
  }
});

require('./core/test/telegraph/main.ts');