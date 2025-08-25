// Keep-Alive HTTP Server for Azure App Service
// This prevents the app from sleeping by providing an HTTP endpoint

const http = require('http');

function createKeepAliveServer() {
  const server = http.createServer((req, res) => {
    if (req.url === '/ping' || req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'alive',
        message: 'Scout is running!',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }));
      console.log('🏓 Keep-alive ping received');
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  const port = process.env.PORT || 8080;
  server.listen(port, () => {
    console.log(`🌐 Keep-alive server running on port ${port}`);
    console.log(`📍 Endpoint: http://localhost:${port}/ping`);
    
    // Self-ping every 15 minutes to prevent Azure sleep
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Self-ping enabled for Azure (every 15 minutes)');
      startSelfPing(port);
    }
  });

  return server;
}

function startSelfPing(port) {
  const pingInterval = 15 * 60 * 1000; // 15 minutes
  
  setInterval(() => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/ping',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      console.log(`🏓 Self-ping successful: ${res.statusCode}`);
    });
    
    req.on('error', (err) => {
      console.log(`⚠️ Self-ping failed: ${err.message}`);
    });
    
    req.end();
  }, pingInterval);
}

module.exports = { createKeepAliveServer };
