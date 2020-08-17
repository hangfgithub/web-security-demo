

const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');


//设置路径
app.use(express.static(path.join(__dirname, 'src')));
// app.use(express.static(path.join(__dirname, '../')));
//将参数转换成对象
app.use(bodyParser.urlencoded({ extended: true }));
//req.cookie[xxx] 获取cookie
app.use(cookieParser());

function encodeHtml(str) {
    return str.replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}


// 模仿反射型攻击，接受来的参数，又传给前端浏览器执行
var searchData = ['js','js1111','jq','vue','react','node','angular']
app.get('/api/search', function(req, res) {
    
    var seach = searchData.filter((item)=>{
        console.log(item.indexOf(req.query.keyWord))
        return item.indexOf(req.query.keyWord) != -1
    })
    res.status(200);

    if(seach.length != 0) {
        res.json({ code: 0, data:seach })
    } else { 
        res.json({ code: 1, data:[], keyWord:req.query.keyWord })
        // 对查询参数进行编码，即可解决当前的XSS攻击(可重启服务查看)
        // res.json({ code: 1, data:[], keyWord:encodeHtml(req.query.keyWord) })
    }
});





// 模仿存储型demo，将恶意代码存储到数据库。
var commentData = ['今天是周五呢','好开心的一天','明天周末啦，好开心']

app.post('/api/addComment', function(req, res) {
    // res.header("Access-Control-Allow-Origin", "*");
    res.status(200),
    //json格式
    commentData.push(req.body.comment)
    // commentData.push(encodeHtml(req.body.comment))
    res.json({ code: 0, commentData })
});


app.get('/api/getComments', function(req, res) {

    // res.header("Access-Control-Allow-Origin", "*");
    res.status(200),
    //json格式
    res.json({ code: 0, data:commentData })
    //传入页面
    // res.send()
});

var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log("服务器启动成功了端口是", port);
})