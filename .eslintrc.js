module.exports = {
  root: true,
  env: {
    es6: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2023,
    project: ['./tsconfig.eslint.json']
  },
  plugins: ['@typescript-eslint', 'jest'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ],
  rules: {},
  overrides: [
    {
      files: ['**/*.{spec,test}.{js,ts,tsx}'],
      env: {
        jest: true
      }
    }
  ]
}
