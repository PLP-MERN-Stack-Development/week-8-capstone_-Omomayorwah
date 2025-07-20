module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'import/extensions': ['error', 'ignorePackages'],
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off',
    'class-methods-use-this': 'off',
    'no-underscore-dangle': 'off',
    'camelcase': 'off',
    'max-len': ['error', { code: 120 }],
    'no-param-reassign': 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx'],
      },
    },
  },
}; 