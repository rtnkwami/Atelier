// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
        'indent': 'off',
        '@typescript-eslint/indent': ['error', 4],
    }
  }
)
