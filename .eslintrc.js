module.exports = {
  root: true,
  plugins: [
    'import',
    'jsdoc',
    'promise',
    'react',
    'react-hooks',
    'security',
    'unicorn',
    '@typescript-eslint',
    'prettier',
  ],
  extends: [
    'airbnb',
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:prettier/recommended'
  ],
  env: {
    browser: true,
    es6: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
    jsdoc: {
      preferredTypes: {
        Array: 'Array<object>', //
        'Array.': 'Array<object>',
        'Array<>': '[]',
        'Array.<>': '[]',
        'Promise.<>': 'Promise<>',
      },
    },
  },
  rules: {
    'prettier/prettier': [
      'error',
      {},
      {
        usePrettierrc: true,
      },
    ],

    'arrow-body-style': ['error', 'as-needed', { requireReturnForObjectLiteral: true }],
    'class-methods-use-this': 'off',
    curly: ['error', 'all'],
    camelcase: 'off',
    'comma-spacing': 'off',
    eqeqeq: ['error', 'smart'],
    'func-names': 'error',
    'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
    'id-length': ['error', { exceptions: ['_', '$', 'e', 'i', 'j', 'k', 'q', 'x', 'y'] }],
    indent: 'off',
    'max-len': 'off',
    'no-confusing-arrow': ['error', { allowParens: false }],
    'no-continue': 'off',
    'no-dupe-class-members': 'off',
    'no-extra-semi': 'off',
    'no-loop-func': 'off',
    'no-mixed-operators': 'error',
    'no-new': 'off',
    'no-plusplus': 'off',
    'no-prototype-builtins': 'off',
    'no-restricted-syntax': ['error', 'DebuggerStatement', 'LabeledStatement', 'WithStatement', 'SequenceExpression'],
    'no-underscore-dangle': 'off',
    'no-use-before-define': 'off',
    'no-useless-constructor': 'off',
    'no-unused-expressions': 'off',
    'no-void': ['error', { allowAsStatement: true }],
    'prefer-spread': 'error',
    'prefer-destructuring': 'off',
    radix: 'off',
    'spaced-comment': 'off',

    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/extensions': ['error', 'never'],
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
        pathGroups: [
          {
            pattern: '@mpirik/**',
            group: 'external',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
      },
    ],

    'jsdoc/check-alignment': 'error',
    'jsdoc/check-indentation': 'off',
    'jsdoc/check-param-names': 'off',
    'jsdoc/check-tag-names': 'error',
    'jsdoc/check-types': 'error',
    'jsdoc/newline-after-description': 'off',
    'jsdoc/no-undefined-types': 'off',
    'jsdoc/require-description': 'off',
    'jsdoc/require-description-complete-sentence': 'off',
    'jsdoc/require-example': 'off',
    'jsdoc/require-hyphen-before-param-description': 'error',
    'jsdoc/require-param': 'error',
    'jsdoc/require-param-description': 'off',
    'jsdoc/require-param-name': 'error',
    'jsdoc/require-param-type': 'error',
    'jsdoc/require-returns-description': 'off',
    'jsdoc/require-returns-type': 'error',
    'jsdoc/valid-types': 'error',

    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    // Disable href validation for next.js Link
    "jsx-a11y/anchor-is-valid": [ "error", {
      "components": [ "Link" ],
      "specialLink": [ "hrefLeft", "hrefRight" ],
      "aspects": [ "invalidHref", "preferButton" ]
    }],
    'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-role': ['error', { ignoreNonDOM: true }],
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/heading-has-content': 'error',
    'jsx-a11y/iframe-has-title': 'error',
    'jsx-a11y/img-redundant-alt': 'error',
    'jsx-a11y/no-access-key': 'error',
    'jsx-a11y/no-distracting-elements': 'error',
    'jsx-a11y/no-redundant-roles': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',
    'jsx-a11y/scope': 'error',

    'promise/always-return': 'error',
    'promise/always-catch': 'off',
    'promise/catch-or-return': ['error', { allowThen: true }],
    'promise/no-native': 'off',
    'promise/param-names': 'error',

    'react/forbid-foreign-prop-types': ['error', { allowInPropTypes: true }],
    'react/jsx-closing-bracket-location': 'error',
    'react/jsx-no-comment-textnodes': 'error',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-script-url': 'error',
    'react/jsx-no-target-blank': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-pascal-case': [
      'error',
      {
        allowAllCaps: true,
        ignore: [],
      },
    ],
    'react/jsx-props-no-multi-spaces': 'error',
    'react/no-danger-with-children': 'error',
    'react/no-deprecated': 'error',
    'react/no-direct-mutation-state': 'error',
    'react/no-is-mounted': 'error',
    'react/no-typos': 'error',
    'react/no-unsafe': 'error',
    'react/no-unstable-nested-components': 'error',
    'react/prefer-stateless-function': 'error',
    'react/require-render-return': 'error',
    'react/self-closing-comp': 'error',
    'react/style-prop-object': 'error',

    // https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",

    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-new-buffer': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-non-literal-require': 'off',
    'security/detect-object-injection': 'off',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-pseudoRandomBytes': 'error',
    'security/detect-unsafe-regex': 'error',

    'unicorn/better-regex': 'error',
    'unicorn/custom-error-definition': 'error',
    'unicorn/error-message': 'error',
    'unicorn/no-abusive-eslint-disable': 'error',
    'unicorn/no-array-for-each': 'error',
    'unicorn/no-array-method-this-argument': 'error',
    'unicorn/no-array-reduce': 'error',
    'unicorn/no-for-loop': 'error',
    'unicorn/no-instanceof-array': 'error',
    'unicorn/no-new-array': 'error',
    'unicorn/no-new-buffer': 'error',
    'unicorn/no-useless-spread': 'error',
    'unicorn/prefer-array-find': 'error',
    'unicorn/prefer-array-flat': 'error',
    'unicorn/prefer-array-flat-map': 'error',
    'unicorn/prefer-array-some': 'error',
    'unicorn/prefer-includes': 'error',
    'unicorn/prefer-number-properties': 'error',
    'unicorn/prefer-object-from-entries': 'error',
    'unicorn/prefer-set-has': 'error',

    '@typescript-eslint/array-type': ['error', { default: 'array' }],
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/adjacent-overload-signatures': 'error',
    '@typescript-eslint/comma-spacing': 'error',
    '@typescript-eslint/consistent-type-assertions': 'error',
    '@typescript-eslint/consistent-type-definitions': 'error',
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', disallowTypeAnnotations: true }],
    '@typescript-eslint/consistent-indexed-object-style': 'error',
    '@typescript-eslint/no-extraneous-class': 'error',
    '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
    '@typescript-eslint/explicit-member-accessibility': ['error'],
    '@typescript-eslint/member-ordering': [
      'error',
      {
        default: [
          // Index signature
          'signature',
          // Fields
          'private-field',
          'public-field',
          'protected-field',
          // Constructors
          'public-constructor',
          'protected-constructor',
          'private-constructor',
          // Methods
          'public-method',
          'protected-method',
          'private-method',
        ],
      },
    ],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'default',
        format: ['camelCase'],
        leadingUnderscore: 'allow',
        trailingUnderscore: 'allow',
      },
      {
        selector: 'property',
        format: null,
      },
      {
        selector: 'function',
        format: ['camelCase', 'PascalCase'],
      },
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        leadingUnderscore: 'allow',
        trailingUnderscore: 'allow',
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
    ],
    '@typescript-eslint/no-array-constructor': 'error',
    '@typescript-eslint/no-empty-interface': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-extra-semi': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-for-in-array': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-parameter-properties': ['error', { allows: ['readonly'] }],
    '@typescript-eslint/no-require-imports': 'error',
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/no-this-alias': 'error',
    '@typescript-eslint/no-throw-literal': 'error',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/no-unused-expressions': 'error',
    '@typescript-eslint/no-use-before-define': [
      'error',
      {
        functions: false,
        classes: true,
        variables: true,
        enums: true,
        typedefs: false,
        ignoreTypeReferences: false,
      },
    ],
    '@typescript-eslint/no-useless-constructor': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/prefer-for-of': 'error',
    '@typescript-eslint/prefer-includes': 'error',
    '@typescript-eslint/prefer-regexp-exec': 'warn',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/promise-function-async': 'off',
    '@typescript-eslint/require-await': 'error',
    '@typescript-eslint/restrict-plus-operands': 'error',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/sort-type-union-intersection-members': 'error',
    '@typescript-eslint/unbound-method': 'error',
    '@typescript-eslint/unified-signatures': 'error',
  },
};
