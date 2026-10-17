import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

// Must match node-red-dashboard-2.widgets[LIBRARY_NAME] in package.json
const LIBRARY_NAME = 'ui-switch-options'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [vue(), cssInjectedByJsPlugin()],
    build: {
        // Source map only for `npm run build:dev` and `npm run dev`
        sourcemap: mode === 'development',

        // Configure build as a UMD library
        lib: {
            entry: 'ui/index.js',
            name: LIBRARY_NAME,
            formats: ['umd'],
            fileName: (format) => `${LIBRARY_NAME}.${format}.js`
        },

        // Utilise Node-RED's handling of /resources folder for the build output
        outDir: './resources',
        emptyOutDir: true,

        // The Dashboard provides Vue and Vuex at runtime, so they are not bundled
        rollupOptions: {
            external: ['vue', 'vuex'],
            output: {
                globals: {
                    vue: 'Vue',
                    vuex: 'vuex'
                }
            }
        }
    }
}))
