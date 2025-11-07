import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import autoprefixer from 'autoprefixer';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  root: 'dist',
  publicDir: resolve(__dirname, 'public'),
  server: {
    port: 9000,
    open: true,
    fs: {
      allow: ['..'],
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "sass:math";`,
        api: 'modern-compiler',
      },
    },
    postcss: {
      plugins: [
        autoprefixer({
          cascade: false,
        }),
      ],
    },
    devSourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'js'),
      '@styles': resolve(__dirname, 'scss'),
      '@fonts': resolve(__dirname, 'fonts'),
      '@images': resolve(__dirname, 'dist/img'),
    },
  },
  plugins: [
    {
      name: 'resolve-css',
      resolveId(id) {
        // Resolve /css/main.css to source scss/main.scss
        if (id === '/css/main.css' || id.startsWith('/css/') && id.endsWith('.css')) {
          const scssFile = id.replace('/css/', 'scss/').replace('.css', '.scss');
          return resolve(__dirname, scssFile);
        }
        return null;
      },
    },
    viteStaticCopy({
      targets: [
        {
          src: 'fonts/*',
          dest: 'fonts',
        },
      ],
    }),
    // Bundle analysis (only in analyze mode)
    process.env.ANALYZE === 'true' &&
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html',
      }),
  ].filter(Boolean),
  build: {
    outDir: '../dist',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'dist/index.html'),
        about: resolve(__dirname, 'dist/about.html'),
        work: resolve(__dirname, 'dist/work.html'),
        freelance: resolve(__dirname, 'dist/freelance.html'),
        sfu: resolve(__dirname, 'dist/sfu.html'),
        'stage-ten': resolve(__dirname, 'dist/stage-ten.html'),
      },
      output: {
        manualChunks: {
          'swiper': ['swiper'],
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `img/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
      },
    },
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'],
      },
      format: {
        comments: false,
      },
    },
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: true,
  },
});
