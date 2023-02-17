/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    // 'no-unused-vars': 1,
    'import/prefer-default-export': 0,
    'no-use-before-define': 0,
    'no-shadow': 0,
    'no-restricted-syntax': 0,
    'no-return-assign': 0,
    'no-param-reassign': 0,
    'no-sequences': 0,
    'no-loop-func': 0,
    'no-nested-ternary': 0,
    'no-bitwise': 0,
    'object-curly-newline': 0,
    'no-plusplus': 0,
    'linebreak-style': 0,
    'import/no-relative-packages': 0,
    'vue/multi-word-component-names': 0,
    'import/no-extraneous-dependencies': 0,
    'import/extensions': 0,
    'import/no-unresolved': 0,
    'max-len': [1, 140, 2, { ignoreComments: true }],
    'react-hooks/exhaustive-deps': 0,
    'import/no-anonymous-default-export': 0,
    'no-promise-executor-return': 0,
    // 'react-hooks/rules-of-hooks': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'default-param-last': 0,
    'no-useless-return': 0,
    quotes: ['error', 'single'],
    radix: 0,
  },
};
