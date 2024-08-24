import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Swapy',
      fileName: (format) => `swapy.${format === 'es' ? 'js' : 'min.js'}`
    }
  },

  plugins: [dts({ rollupTypes: true }), react(), vue(), svelte()]
})
