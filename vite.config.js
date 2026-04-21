import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import zipPack from 'vite-plugin-zip-pack' // or fflateZip
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'manifest.json', dest: '.' },
        { src: 'public/icons', dest: '.' },
      ]
    }),
    zipPack({
      folderPath: path.resolve(__dirname, 'dist'),
      outPath: path.resolve(__dirname),
      zipName: 'dist.zip',
      // enabled: env.NODE_ENV === 'production' ? true : false
    })
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content.js'),
        options: resolve(__dirname, 'options.html')
      },
      output: {
        entryFileNames: chunkInfo => chunkInfo.name === 'content' ? 'content.js' : 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
});
