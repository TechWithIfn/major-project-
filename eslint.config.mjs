import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const nextConfig = require('eslint-config-next')

// Relax strict React Compiler rules that flag common patterns (mounted check, initial state with Date.now)
const overrides = [
  {
    ignores: ['.venv/**', 'node_modules/**', '.next/**', 'dist/**', 'build/**'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'react-hooks/purity': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]

const config = [...nextConfig, ...overrides]
export default config
