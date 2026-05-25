import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { normalizeApiEndpoint } from './services/endpoint';

function livermoreApiProxy(env: Record<string, string>) {
  const apiKey = env.ARK_API_KEY || env.VOLCENGINE_API_KEY || '';

  return {
    name: 'livermore-api-proxy',
    configureServer(server) {
      server.middlewares.use('/api/livermore/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Method not allowed' }));
          return;
        }

        if (!apiKey) {
          res.statusCode = 501;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Local API proxy is not configured.' }));
          return;
        }

        try {
          const rawBody = await new Promise<string>((resolve, reject) => {
            let body = '';
            req.setEncoding('utf8');
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', () => resolve(body));
            req.on('error', reject);
          });
          const payload = JSON.parse(rawBody || '{}');
          const {
            apiEndpoint = '',
            modelId = '',
            systemPrompt = '',
            messages = [],
          } = payload;
          const trimmedModelId = String(modelId).trim();

          if (!trimmedModelId) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'Missing model ID.' }));
            return;
          }

          if (trimmedModelId.startsWith('cm-')) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              message: 'cm-... 是模型仓库 ID，不能直接调用。请填写模型接入点 ID（通常是 ep-...）。',
            }));
            return;
          }

          const targetEndpoint = normalizeApiEndpoint(String(apiEndpoint));
          const apiMessages = [
            { role: 'system', content: String(systemPrompt) },
            ...messages.map((message) => ({
              role: message.role,
              content: message.content,
            })),
          ];

          const upstream = await fetch(targetEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              model: trimmedModelId,
              messages: apiMessages,
              stream: false,
            }),
          });
          const text = await upstream.text();

          res.statusCode = upstream.status;
          res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
          res.end(text);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Local proxy failed.';
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), livermoreApiProxy(env)],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
