const http = require('http');
const fs = require('fs');
http.createServer((req, res) => {
        const html = fs.readFileSync('./src/xss-search.html', 'utf8');
        res.writeHead(200, {
            'Content-Type': 'text-html',
            'Content-Security-Policy': 'script-src \'self\'' 
        });
        res.end(html);
}).listen(3000);

console.log('server listening on 3000');