import { globalIgnores } from 'eslint/config'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import neostandard from 'neostandard'

export default [
    globalIgnores(['resources/**']),
    ...neostandard({ noJsx: true, files: ['**/*.vue'] }),
    ...pluginVue.configs['flat/recommended'],
    {
        files: ['**/*.{js,cjs,mjs}'],
        rules: {
            '@stylistic/indent': ['error', 4]
        }
    },

    // Nodes use CommonJS and run in the Node-RED runtime
    {
        files: ['nodes/**/*.js'],
        languageOptions: {
            sourceType: 'commonjs',
            globals: globals.node
        }
    },

    // The widget runs in the browser and is built with Vite
    {
        files: ['ui/**/*.vue', 'ui/**/*.js'],
        languageOptions: {
            globals: globals.browser
        }
    },
    {
        files: ['ui/**/*.vue'],
        rules: {
            '@stylistic/indent': 'off',
            'vue/script-indent': ['error', 4, { baseIndent: 0 }],
            'vue/html-indent': ['error', 4],
            'vue/max-attributes-per-line': 'off',
            'vue/singleline-html-element-content-newline': 'off',
            // Labels accept HTML by design. They come from the editor or the flow, never from dashboard users.
            'vue/no-v-html': 'off'
        }
    }
]
