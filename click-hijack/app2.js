const http = require('http');
const fs = require('fs');

const express = require('express');
const app = express();

app.get('/attack.html',(req,res)=>{
    const html = fs.readFileSync('./src/attack.html', 'utf8');
    res.writeHead(200, {
        'Content-Type': 'text-html',
    });
    res.end(html);
})

app.listen(3004)


console.log('server listening on 3004');