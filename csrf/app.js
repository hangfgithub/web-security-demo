/**
 * 用户登录之后，返回登录标识 cookie
 */

const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const svgCaptcha = require('svg-captcha');

//设置路径
app.use(express.static(path.join(__dirname, 'src')));
// app.use(express.static(path.join(__dirname, '../')));
//将参数转换成对象
app.use(bodyParser.urlencoded({ extended: true }));
//req.cookie[xxx] 获取cookie
app.use(cookieParser());

//用户列表
let userList = [
    { username: '111', password: '111', account: 1000 }, 
    { username: '222', password: '222', account: 100000 }
];

let COOKIE_ID = 'cookie_id';
let session = {};
//登录接口
app.post('/api/login', (req, res) => {
    let { username, password } = req.body;
    let user = userList.find(item => item.username === username && item.password === password);
    if (user) {
        //用户登录后，给一个标识(cookie登录)
        const sessionId = Math.random() + Date.now();
        session[sessionId] = { user };
        res.cookie(COOKIE_ID, sessionId);
        // res.cookie(COOKIE_ID, sessionId,{ sameSite: 'Strict' });
        res.json({ code: 0 });
    } else {
        res.json({ code: 1, error: `${username}不存在或密码错误` });
    }

});



app.get('/api/userinfo', (req, res) => {
    let info = session[req.cookies[COOKIE_ID]];
    /**增加验证码 */
    //data:svg， text:验证码文本
    let {data, text} = svgCaptcha.create();
    if (info) {
        //用户已经登录
        let username = info.user.username;
        info.code = text; //下次请求时，对比验证码
        // res.json({ code: 0, info: { username, account: info.user.account } });
        res.json({ code: 0, info: { username, account: info.user.account, svg: data } });
    } else {
        res.json({ code: 1, error: 'user not logged in.' });
    }
});

app.post('/api/transfer', (req, res) => {
    let info = session[req.cookies[COOKIE_ID]];
    if (info) {
        //用户已经登录
        let {payee, amount} = req.body;
        let username = info.user.username;
        userList.forEach(user => {
          // 转账的人减去amount
            if(user.username === username) {
                user.account -= Number(amount);
            }

            // 收款人增加amount
            if(user.username === payee) {
                user.account += Number(amount);
            }
        })
        res.json({ code: 0 });
    } else {
        res.json({ code: 1, error: 'user not logged in.' });
    }
});

//转账前，先验证 验证码
app.post('/api/transfer1', (req, res) => {
    let info = session[req.cookies[COOKIE_ID]];
    if (info) {
        //用户已经登录
        let {payee, amount, code} = req.body;
        if(code && code.toUpperCase() === info.code.toUpperCase() && Number(amount)) {
            //验证码正确
            let username = info.user.username;
            userList.forEach(user => {
                if(user.username === username) {
                    user.account -= Number(amount);
                }
                if(user.username === payee) {
                    user.account += Number(amount);
                }
            })
            res.json({ code: 0 });
        }else{
            res.json({ code: 1, error: 'code error.' });
        }
        
    } else {
        res.json({ code: 1, error: 'user not logged in.' });
    }
});

//转账前，判断请求来源(referer)
app.post('/api/transfer2', (req, res) => {
    let info = session[req.cookies[COOKIE_ID]];
    if (info) {
        //用户已经登录
        let {payee, amount} = req.body;
        let referer = req.headers['referer'] || '';
        if(Number(amount) && referer.includes('localhost:3001')) {
            //referer正确
            let username = info.user.username;
            userList.forEach(user => {
                if(user.username === username) {
                    user.account -= Number(amount);
                }
                if(user.username === payee) {
                    user.account += Number(amount);
                }
            })
            res.json({ code: 0 });
        }else{
            res.json({ code: 1, error: 'illegal source of request .' });
        }
        
    } else {
        res.json({ code: 1, error: 'user not logged in.' });
    }
});


//转账前，先验证 token
app.post('/api/transfer3', (req, res) => {
    let info = session[req.cookies[COOKIE_ID]];
    if (info) {
        //用户已经登录
        let {payee, amount, token} = req.body;
        console.log(token, 'mytoken_' + req.cookies[COOKIE_ID])
        if(token === 'mytoken_' + req.cookies[COOKIE_ID] && Number(amount)) {
            //token 正确
            let username = info.user.username;
            userList.forEach(user => {
                if(user.username === username) {
                    user.account -= Number(amount);
                }
                if(user.username === payee) {
                    user.account += Number(amount);
                }
            })
            res.json({ code: 0 });
        }else{
            res.json({ code: 1, error: 'illegal.' });
        }
        
    } else {
        res.json({ code: 1, error: 'user not logged in.' });
    }
});

app.listen(3001);