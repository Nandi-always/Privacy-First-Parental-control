const http = require('http');
const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, 'build');

const server = http.createServer((req, res) => {
  let filePath = path.join(buildDir, req.url);
  
  // If it's a directory or root, serve index.html
  if (filePath.endsWith('/') || !path.extname(filePath)) {
    filePath = path.join(buildDir, 'index.html');
  }
  
  // Security: prevent directory traversal
  if (!filePath.startsWith(buildDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Serve index.html for SPA routing
        const indexPath = path.join(buildDir, 'index.html');
        fs.readFile(indexPath, 'utf8', (err, data) => {
          if (err) {
            res.writeHead(500);
            res.end('Internal Server Error');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        });
      } else {
        res.writeHead(500);
        res.end('Internal Server Error');
      }
      return;
    }
    
    if (stats.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      fs.readFile(indexPath, 'utf8', (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
      return;
    }
    
    // Determine content type
    const ext = path.extname(filePath);
    const contentTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.wav': 'audio/wav',
      '.mp4': 'video/mp4',
      '.woff': 'font/woff',
      '.ttf': 'font/ttf'
    };
    
    const contentType = contentTypes[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Internal Server Error');
        return;
      }
      
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      res.end(data);
    });
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`\nServing build from ${buildDir}`);
  console.log(`Frontend is running at http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop\n`);
});
