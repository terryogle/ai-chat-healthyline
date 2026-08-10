import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

// Opzione per includere Vue nel bundle (può essere controllata tramite variabile d'ambiente)
const includeVue = 'true';

function mockWebhookPlugin() {
  return {
    name: 'mock-webhook-plugin',
    configureServer(server: any) {
      server.middlewares.use('/api/webhook', (req: any, res: any) => {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk; });
        req.on('end', () => {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Headers', '*');
          if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            return res.end();
          }

          let parsedBody: any = {};
          try {
            parsedBody = body ? JSON.parse(body) : {};
          } catch (e) {}

          if (parsedBody.action === 'loadPreviousSession' || (req.url && req.url.includes('loadPreviousSession'))) {
            return res.end(JSON.stringify({
              data: [
                {
                  id: "msg-1",
                  kwargs: {
                    content: "Benvenuto! Come posso aiutarti oggi con i servizi TourTools?"
                  }
                }
              ]
            }));
          }

          const userText = parsedBody.chatInput || 'Messaggio ricevuto!';
          let responseText = `Thank you for your message: "${userText}". How can I assist you with HealthyLine products?`;
          let actions: any[] = [];

          res.end(JSON.stringify({
            output: responseText,
            actions: actions
          }));
        });
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
  plugins: [
    vue(),
    dts({ include: ['src'] }),
    mockWebhookPlugin(),
  ],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [resolve(__dirname, './src/scss')],
        api: "modern"
      }
    }
  },
  build: {
    assetsInlineLimit: 8192,
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'SimpleChatN8N',
      fileName: (format) => (includeVue ? `tt-chat.bundle.${format}.js` : `tt-chat.${format}.js`),
    },
    rollupOptions: {
      // Decidi se includere o escludere Vue e dipendenze dal bundle
      external: includeVue ? [] : ['vue', 'vue-select'],
      output: {
        globals: includeVue ? {} : {
          vue: 'Vue',
          'vue-select': 'VueSelect',
        },
        exports: 'named',
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.error', 'console.warn', 'console.info', 'console.debug'],
      },
    },
  },
});