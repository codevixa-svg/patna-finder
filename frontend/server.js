/**
 * Custom Next.js server for cPanel shared hosting (CloudLinux Passenger).
 *
 * cPanel's "Setup Node.js App" runs this file as the Application startup file.
 * Passenger assigns a random internal port and passes it via the PORT env var,
 * so this server MUST listen on process.env.PORT (never hardcode 3000).
 *
 * Local usage (rarely needed):  NODE_ENV=production PORT=3000 node server.js
 */
const { createServer } = require('http');
const next = require('next');

const port = parseInt(process.env.PORT, 10) || 3000;
const hostname = process.env.HOST || '0.0.0.0';
const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      handle(req, res);
    }).listen(port, hostname, () => {
      console.log(`> Patna Finder frontend ready on http://${hostname}:${port} (${dev ? 'dev' : 'production'})`);
    });
  })
  .catch((err) => {
    console.error('Failed to start Next.js server:', err);
    process.exit(1);
  });
