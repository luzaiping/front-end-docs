CSRF
===============

Cross Site Request Forgery

## how does csrf work?

要执行 CSRF，通常需要满足下面三个关键条件：

1. A relevant action.
  应用中要有一个攻击者有理由诱导用户执行的操作。比如修改用户权限、修改用户密码（邮箱）,转账等
1. Cookies-based session handling.
  应用仅依赖于 session cookies 来识别发送请求的用户
1. No unpredictable request param.
  用于执行操作的请求没有包含任何攻击者无法预知或者猜测的参数。（比如修改用户密码，如果这个请求需要提供旧密码，那么攻击者就无法进行攻击，因为他并不知道旧密码）
  
举个例子进行说明：

POST /email/change HTTP/1.1
Host: vulnerable-website.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 30
Cookie: session=yvthwsztyeQkAPzeQ5gHgTvlyxHfsAfE

email=wiener@normal-user.com

上面是一个修改邮箱的 Post 请求，这个请求就满足 CSRF 攻击的三个关键条件：

1. 修改邮箱操作，攻击者执行这个操作就有可能完全控制用户帐号
1. 这个请求是基于 cookies-based 的session管理
1. 所有请求参数，攻击者都可以构造

攻击者只需要构造下面这样的一个页面：
```html
<html>
  <body>
    <form action="https://vulnerable-website.com/email/change" method="POST">
      <input type="hidden" name="email" value="pwned@evil-user.net" />
    </form>
    <script>
      document.forms[0].submit();
    </script>
  </body>
</html>
```

然后诱导用户访问这个页面（怎么诱导后面再说），一旦用户访问了这个页面，就会发生如下事情：

1. 这个页面会像目标网站发生一个 POST 请求
1. 如果用户已经在目标网站登陆了，浏览器会自动将 session cookies 包含在请求中（假设网站没有使用 SameSite cookies）
1. 目标网站的服务端接收到这个请求后，会正常的执行这个请求，因为服务端并不能区分这个请求是受害者主动发起还是被诱导发起

__注意__: CSRF 通常是说跟 session cookies 有关。其实其他场景也会有这样的问题存在，只要应用会自动将用户凭证信息添加到请求中，都会有这个问题存在。比如 HTTP Basic authentication, certificate-based authentication.

## How to deliver a CSRF exploit

通常攻击者会将构造好的`恶意html`放到他能控制的网站，然后引导用户去访问。比如在网站提供一个链接链到这个恶意页面，或者通过邮件，短信包含这个链接，或者将链接放到一些博客的评论里面，可以在加一些诱惑性的词语，引诱用户去点击。

## prevent CSRF attack

### CSRF token

#### what are CSRF token

一个 CSRF token 是一个 unique、secret、unpredictable value, 这个值是由服务端生成，传输给客户端，后续请求需要带上这个 token，服务端会校验这个 token 值，如果值不存在或者不匹配，那么就拒绝这个请求。

CSRF token 可以用来阻止 CSRF 攻击是因为攻击者无法知道或者预知用户的 CSRF token 值，因此就无法构造满足要求的请求参数。这个也是最安全的防范方式。

#### how should CSRF tokens to be transmitted

通常有以下三种方式来传输 tokens

1. 在 form 表单里添加一个 `<input type='hidden' name='csrf-token' value='xxxxxxxx' />`
  这个是最常用的方式。为了尽可能的安全，这个字段应该尽早包含在 HTML document 中
2. 在 url 后面加上 querystring 带上 token
3. 在自定义的 request header 里携带 token 值
  这种方式对应攻击者来说会更加困难，因为浏览器不允许自定义headers通过跨域方式传输

#### How should CSRF tokens be validated (应该如何验证 CSRF token)

服务端在生成 token 后，应该将 token 存储到用户的 session 里，这样后续请求携带过来的 token，就可以跟服务端用户session 中的 token 进行比对。

### SameSite cookies

SameSite attribute 可以在服务端返回 cookies 响应头 Set-Cookie 里被添加进来，这个属性有两个值可以设置：

SetCookie: SessionId=sYMnfCUrAlmqVVZn9dqevxyFpKZt30NN; SameSite=Strict;

SetCookie: SessionId=sYMnfCUrAlmqVVZn9dqevxyFpKZt30NN; SameSite=Lax;

如果值是 Strict，如果请求是从其他网站发起，那么浏览器不会将 cookies 包含到任何请求中。这个是最安全的防范属性，但是这个会有问题，比如用户之前在网站上已经登陆了，然后通过第三方网站（比如百度搜索）再次进入网站，由于不会自动包含 cookies 到请求中，用户就需要再次登陆，从而影响用户体验

如果值是 Lax，请求从其他网站发起，需要满足下面2个条件，浏览器才会将 cookies 包含到请求中:

1. 必须是 GET 请求。如果是其他请求，那就不会包含 cookies
1. 这个请求必须是用户操作引起，比如用户点击超链接进来。如果是其他请求，比如通过 scripts 进入网站，那么 cookies 是不会被包含到请求中

使用 Lax 值，可以提供部分保护效果，因为 CSRF 通常是通过 POST 请求发起。但是不能完全依赖这个方式来防范 CSRF 攻击，毕竟有些网站可能会使用 GET 请求来执行敏感的操作。

SameSite cookies 只能作为辅助方式，作为 CSRF token 防范方式的一种补充。

### Referer-based

除了 CSRF token 这种防范方式之外，有些应用也会使用 HTTP Referer header 来防范 CSRF 攻击。

这种防范方式是通过 HTTP Referer header 获取发起请求的网站域名，如果这个域名不是当前应用的域名，那么就拒绝请求。相比而已，这种方式会更容易被绕过。

当用户从其他网站发起到目标网站的请求时，浏览器会自动添加 HTTP Referer header，比如用户点击链接或者提交表单，那么这个请求最终发送到目标网站，再发送给服务端时， http request header 里会包含一个 `referer: xxx.xxx`

但是有些方法允许修改这个 header 或者 不发送这个 header。

#### 不发送 referer header

攻击者可以在构造的 html 页面里，添加如下代码，这样跳转到目标网站后，就不会包含 HTTP Referer header
```html
<meta name="referrer" content="never">
```
#### 规避 Referer 校验

比如目标网站的域名是 `vulnerable-website.com`，攻击者的网站域名是 `attacker-website.com`, 攻击者可以在他的子域名网站 `vulnerable-website.com.attacker-website.com` 发起攻击；如果目标网站服务端只是校验 Referer 包含 `vulnerable-website.com` 这个信息，那么这个攻击就会被绕过。

因此不要完全依赖 Referer-based 来方法 CSRF 攻击。

## Common CSRF vulnerabilities

比如下面这个例子

POST /email/change HTTP/1.1
Host: vulnerable-website.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 68
Cookie: session=2yQIDcpia41WrATfjPqvm9tOkDvkMvLm

csrf=WfF1szMUHhiokx9AHFply5L2xAOfjRkE&email=wiener@normal-user.com

在 POST 请求中带上 csrf token。但是如果没有正确使用 CSRF token，也会导致这种防范方式被击破。

### 只防范了某些请求方法

比如上面那个例子对 POST 请求进行了防范，但是可能疏忽，导致 GET 请求也可以被执行，并且没有防范，那么攻击者就可以发起 GET 请求

GET /email/change?email=pwned@evil-user.net HTTP/1.1
Host: vulnerable-website.com
Cookie: session=2yQIDcpia41WrATfjPqvm9tOkDvkMvLm

### 只校验token值是否非法，漏掉token不存在的情形

这种情形，攻击者就可以不传任何 token，就可以绕过防范

### 没有基于 user session 进行校验

如果服务端维持一个 `全局` 的token pool, 只要是服务端生成的 token 都是合法的 token，那么攻击者就可以用自己的帐号登陆，获取到他的 token，然后将这个 token 作为其他受害者的 token，再诱导用户发送请求到服务端，服务端就会允许执行请求。
实际应该是针对 user session 进行校验，每个请求的 token 应该跟 user session 中的 token 进行比对