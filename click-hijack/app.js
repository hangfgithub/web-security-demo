const http = require('http');
const fs = require('fs');

const express = require('express');
const app = express();

app.get('/index.html',(req,res)=>{
    // X-Frame-Options设置为DENY，表示当前页面不允许在frame中加载展示，以防止被劫持
    // res.setHeader('X-FRAME-OPTIONS','DENY')
    const html = fs.readFileSync('./src/index.html', 'utf8');
    res.writeHead(200, {
        'Content-Type': 'text-html',
    });
    res.end(html);
})

app.listen(3003)


console.log('server listening on 3003');