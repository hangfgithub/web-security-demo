# web安全

## XSS 攻击

### 反射型XSS攻击
1. 进入 xss 目录，运行 node app.js (启动本地服务器)
2. 在浏览器中访问 `localhost:3000/xss-search.html`
3. 正常输入 j ，会返回含有 j 的所有结果
4. 现在开始攻击：输入  `<script>alert(1)</script>`，点击搜索，此时浏览器执行了脚本，并弹出弹窗1，完成了攻击！！！
### 反射型XSS攻击防御

*  编辑器打开xss目录中的 app.js
* 找到`/api/search`接口
* 修改搜索无结果时的返回内容，改为如下代码：

        res.json({ code: 1, data:[], keyWord:encodeHtml(req.query.keyWord) })
        
* 重启服务：node app.js
* 访问浏览器 `localhost:3000/xss-search.html`，并输入`<script>alert(1)</script>`，点击搜索，此时不会弹窗。因为我们进行了过滤转义

### 存储型XSS攻击

1. 进入 xss 目录，运行 node app.js (启动本地服务器)
2. 在浏览器中访问 `localhost:3000/xss-comment.html`
3. 正常输入评论内容`开心ing` ，评论列表会多一条`开心ing`的内容。
4. 现在开始攻击：输入`<script>alert(1)</script>`，点击发表，此时浏览器执行了脚本，并弹出弹窗1，完成了攻击！！！这时，这条评论内容存储到了服务器，所有访问评论区的用户都会遭受到攻击。。。。此外攻击者也可以通过刷接口的方式向服务器注入恶意脚本。

### 存储型XSS防御
1. 编辑器打开xss目录中的 app.js
2. 找到`/api/addComment`接口
3. 对传入的参数`comment`进行过滤转义: `commentData.push(encodeHtml(req.body.comment))`
4. 重启服务：node app.js
5. 访问浏览器 `localhost:3000/xss-comment.html`，并输入`<script>alert(1)</script>`，点击发表，此时不会弹窗。因为我们进行了过滤转义。
6. 当然我们也可以在前端做过滤，但是对入数据库的数据做过滤不更安全嘛～～～


### DOM型XSS攻击
 1. 进入 xss 目录，运行 node app.js (启动本地服务器)
 2. 在浏览器中访问 `localhost:3000/xss-dom.html?name=hgf`
 3. 此时页面显示 `hgf邀请你瓜分100亿红包啦`
 4. 现在把url改为 `localhost:3000/xss-dom.html?name=<script>alert(1)</script>`，点击回车，这时页面弹出1，完成了攻击！！！如果我把这个url发给别人，别人一旦点击就会遭到攻击。（*这里只是alert，攻击者可不会这么简单，他会获取你的cookie 得到用户名密码等等*）
 
 
### DOM型XSS防御
1. 编辑器打开xss/src/xss-dom.html文件
2. 将url的name参数进行过滤转义：将 `getUrlParam('name')` 改为 `encodeHtml(getUrlParam('name'))`
3. 打开浏览器继续访问 `localhost:3000/xss-dom.html?name=<script>alert(1)</script>` ，回车，这时页面不会弹窗。


**xss攻击还有一种情况，比如在url后面加一个`name=javascript:document.write('<script/src=//xxxxxxx?>')`,此时前端没有做过滤，直接将脚本插入到页面，脚本就会执行：在页面写入一个script并且引入攻击者的攻击文件。这时除了对脚本进行过滤，还有一种防御方法：**

1. 编辑器打开 xss/app1.js
2. 可以看到我们读到了 `xss-search.html` 并添加了一个 `'Content-Security-Policy': 'script-src \'self\'' `的请求头，这个请求头的意思是，xss-search.html的script标签只允许加载自己域名下的文件。这样就阻止了第三方的攻击脚本的引入。 ( 注：此方法防御不了攻击者用接口的方式获取本站的cookie)


 
## CSRF攻击

1. 进入 csrf 目录，运行 node app.js (端口号为3001)
2. 再打开一个命令行窗口执行 node app1.js （端口号为3002）
3. 浏览器中访问 `http://localhost:3001/index.html`，没有登录的情况下自动跳转登录页
4. 使用 222/222 登录，可以看到 222 的账号有 10W 的余额
5. 打开一个无痕浏览器窗口，访问 `http://localhost:3001/index.html`，使用111/111登录，可以看到111账号有1000余额。
5. 现在准备攻击222账户： 222 已经登录了，cookie已经有了，这个时候，有人给你发了个钓鱼网站的链接: `http://localhost:3002/fish.html`，你点过去了，你的钱就被偷偷偷走了~~~
6. 222 此时访问`http://localhost:3001/index.html`发现账户少了100元。钱到了哪里了呢？
7. 无痕浏览器打开`http://localhost:3001/index.html`,发现111账户多了100元。


## CSRF防御
### 1. 使用 `sameSite`属性

1. 编辑器打开csrf/app.js
2. 找到接口 `/api/login`，设置cookie
时，设置sameSite为'Strict'，这个字段代表，不允许第三方接口访问时携带cookie，只允许自己域名下的接口携带cookie
。
3.这时访问钓鱼网站`http://localhost:3002/fish.html`，你的钱并不会被偷走。

### 2. 转账接口使用验证码验证
1. 利用svg-captcha(已安装依赖)
2. 编辑器打开`csrf/src/attack.html`,把接口`api/transfer`换为 `api/transfer1`,具体`api/transfer1`怎么实现的，请到`csrf/app.js`查看
3. 这时访问钓鱼网站`http://localhost:3002/fish.html`，你的钱并不会被偷走。


### 3. 判断来源(referer) 【referer并不安全，应该referer是可以被修改的】

1. 编辑器打开`csrf/src/attack.html`,把接口`api/transfer`换为 `api/transfer2`,具体`api/transfer2`怎么实现的，请到`csrf/app.js`查看
2. 这时访问钓鱼网站`http://localhost:3002/fish.html`，你的钱并不会被偷走。

### 4. 使用token 
1. 编辑器打开`csrf/src/attack.html`,把接口`api/transfer`换为 `api/transfer3`,具体`api/
transfer3`怎么实现的，请到`csrf/app.js`查看
2. 这时访问钓鱼网站`http://localhost:3002/fish.html`，你的钱并不会被偷走。

## 点击劫持
1. 进入`click-hijack` 目录，运行node app.js
2. 浏览器打开 `http://localhost:3003/index.html`,
3. 看到有很多投票按钮，可以任意投票
4. 现在再开一个命令行工具 运行 node app2.js
5. 浏览器打开 `http://localhost:3004/attack.html`，这时界面看到一个按钮，当你点击这个按钮的时候，实际上是给hgf投票了。

### 防御
1. 编辑器打开 `click-hijack/app.js`
2. 添加 `res.setHeader('X-FRAME-OPTIONS','DENY')`
3. 此时再浏览器打开 `http://localhost:3004/attack.html`，发现index.html并没有加载出来。

***（X-Frame-Options设置为DENY，表示当前页面不允许在frame中加载展示，以防止被劫持）***



