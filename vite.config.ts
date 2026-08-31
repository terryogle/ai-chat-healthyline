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

          const action = parsedBody.action;

          if (action === 'requestOtp') {
            const email = (parsedBody.email || '').trim().toLowerCase();
            if (!email || !email.includes('@')) {
              return res.end(JSON.stringify({
                success: false,
                message: "Please enter a valid email address."
              }));
            }
            return res.end(JSON.stringify({
              success: true,
              message: `We sent a 6-digit code to ${email}.`
            }));
          }

          if (action === 'verifyOtp') {
            const code = (parsedBody.code || '').trim();
            if (code.length === 6 && /^\d+$/.test(code)) {
              return res.end(JSON.stringify({
                success: true,
                message: "Verified",
                email: parsedBody.email
              }));
            } else {
              return res.end(JSON.stringify({
                success: false,
                message: "Incorrect verification code. Please try again."
              }));
            }
          }

          if (action === 'getCatalog') {
            return res.end(JSON.stringify({
              items: [],
              categories: [],
              total: 0
            }));
          }

          if (action === 'loadPreviousSession' || (req.url && req.url.includes('loadPreviousSession'))) {
            return res.end(JSON.stringify({
              data: [
                {
                  id: "msg-1",
                  kwargs: {
                    content: "Welcome to HealthyLine! How can I help you today?"
                  }
                }
              ]
            }));
          }

          const userText = (parsedBody.chatInput || parsedBody.message || '').trim();
          let responseText = `Thank you for your message: "${userText}". How can I assist you with HealthyLine products or orders?`;
          let actions: any[] = [];

          if (userText && /auth|verify|account|order auth|check order/i.test(userText)) {
            responseText = `To view and manage your orders or account details, please verify your email address:\n\n[ACTION:customer_auth]`;
          }

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
export default defineConfig(({ mode }) => {
  // Build as SPA app for production unless explicitly running in lib mode
  const isAppOnly = mode !== 'lib';

  return {
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
    build: isAppOnly ? {
      outDir: 'dist',
    } : {
      outDir: 'dist',
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
  };
});