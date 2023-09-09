module.exports = {
  root: true,
  env: {
    node: true
  },
  parserOptions: {},
  extends: ['eslint:recommended', 'prettier'],
  plugins: [],
  rules: {
    semi: [2, 'never'],
    camelcase: 'off',
    'no-console': 'off',
    'no-useless-constructor': 'off',
    'vue/html-self-closing': 'off'
  }
}
