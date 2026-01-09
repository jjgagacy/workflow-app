// eslint.config.js (ESLint 9+ 的扁平化配置)
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    plugins: {
      'react-hooks': reactHooks
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-dooks': 'warn'
    }
  }
];