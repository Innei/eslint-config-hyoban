import type { Linter } from 'eslint'
import typescriptEslint from 'typescript-eslint'

import { DEFAULT_GLOB_TS_SRC } from '../consts'
import type { Options } from '../option'

export function typeScriptConfigs({
  strict,
  typeChecked,
  project,
  projectService,
  tsconfigRootDir,
  filesDisableTypeChecking,
}: Required<Options>) {
  const typescriptPreset = strict
    ? (typeChecked === true
        ? typescriptEslint.configs.strictTypeChecked
        : typescriptEslint.configs.strict)
    : (typeChecked === true
        ? typescriptEslint.configs.recommendedTypeChecked
        : typescriptEslint.configs.recommended)
  return [
    typescriptEslint.configs.base as Linter.FlatConfig,
    [
      ...typescriptPreset,
      typeChecked && {
        languageOptions: {
          parserOptions: {
            project,
            projectService,
            tsconfigRootDir,
          },
        },
      },
    ] as Linter.FlatConfig[],
    [
      {
        name: 'typescript-eslint/custom',
        files: DEFAULT_GLOB_TS_SRC,
      },
      {
        rules: {
          'no-use-before-define': 'off',

          '@typescript-eslint/ban-ts-comment': 'off',

          '@typescript-eslint/consistent-type-imports': 'error',
          '@typescript-eslint/no-import-type-side-effects': 'error',

          // https://www.totaltypescript.com/method-shorthand-syntax-considered-harmful
          '@typescript-eslint/method-signature-style': ['error', 'property'],
        },
      },
      strict && {
        rules: {
          '@typescript-eslint/ban-ts-comment': 'error',
          '@typescript-eslint/no-non-null-assertion': 'off',
        },
      },
      typeChecked
      && (typeChecked === 'essential'
        ? {
            rules: {
              // https://youtu.be/OVNQWzdhCQA?si=PvPOOgtGW5H4uRB7
              '@typescript-eslint/await-thenable': 'error',
              '@typescript-eslint/no-floating-promises': 'error',
              '@typescript-eslint/no-misused-promises': [
                'error',
                {
                  checksVoidReturn: { arguments: false, attributes: false },
                },
              ],
            },
          }
        : {
            rules: {
              '@typescript-eslint/consistent-type-exports': 'error',
              '@typescript-eslint/no-misused-promises': [
                'error',
                {
                  checksVoidReturn: { arguments: false, attributes: false },
                },
              ],
              '@typescript-eslint/restrict-template-expressions': ['error', {}],
            },
          }),
    ] as Linter.FlatConfig[],
    () => {
      if (filesDisableTypeChecking.length === 0)
        return

      return {
        files: filesDisableTypeChecking,
        ...typescriptEslint.configs.disableTypeChecked,
      } as Linter.FlatConfig
    },
  ]
}
