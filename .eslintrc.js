module.exports = {
    extends: ['erb'],
    plugins: ['@typescript-eslint', 'unused-imports'],
    rules: {
        '@typescript-eslint/require-await': ['error'],
        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true, ignoreIIFE: true }],
        '@typescript-eslint/no-misused-promises': ['error', { checksConditionals: true, checksSpreads: true, checksVoidReturn: false }],
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        // 'comma-dangle': ['error', 'always-multiline'],  // May conflict with prettier
        'curly': ['error', 'all'],
        'import/extensions': ['warn', 'never', { css: 'always', scss: 'always', json: 'always' }],
        // A temporary hack related to IDE not resolving correct package.json
        'import/no-extraneous-dependencies': 'off',
        'import/no-import-module-exports': 'off',
        'import/no-unresolved': 'error',
        'jsx-a11y/label-has-associated-control': 'off',
        'jsx-a11y/control-has-associated-label': 'off',
        'max-classes-per-file': 'off',
        'no-shadow': 'off',
        'no-undef': 'off',
        'no-unused-vars': 'off',
        'no-use-before-define': 'off',
        'prefer-const': 'warn',
        'prettier/prettier': 'off',
        'react/jsx-filename-extension': ['warn', { extensions: ['.tsx'] }],
        'react/react-in-jsx-scope': 'off',
        'require-await': 'off',
        "import/first": "error",
        "import/newline-after-import": "error",
        "import/no-duplicates": "error",
        "import/prefer-default-export": "off",
        "no-console": ["warn", { allow: ["warn", "error"] }],
        "no-plusplus": 'off',
        "no-restricted-syntax": "off",
        "no-underscore-dangle": 'off',
        "react/function-component-definition": 0,
        // "react/jsx-tag-spacing": ["error", { "beforeSelfClosing": "always" }],  // May conflict with prettier
        "react/require-default-props": "off", // this is actually now being depricated in react so we shouldnt use default props
        "sort-imports": ["error", { "ignoreDeclarationSort": true }],
        "unused-imports/no-unused-imports": "error",
        "unused-imports/no-unused-vars": ["warn", { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" }],
    },
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        createDefaultProgram: true,
    },
    settings: {
        'import/resolver': {
            // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
            node: {},
            webpack: {
                config: require.resolve('./.erb/configs/webpack.config.eslint.ts'),
            },
            typescript: {},
        },
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
    },
};
