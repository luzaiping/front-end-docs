http
===============

要使用 HTTP server 和 client，可以通过引入 http 模块

为了支持所有可能的 HTTP 应用程序，Node.js 的 HTTP API 都是非常底层。它仅进行流处理和消息解析。它将消息解析为 headers 和 body，但不会解析具体的 header 或者 body.

如果要处理具体 headers，可以通过 `IncomingMessage.headers`。

该模块由以下几个类组成：

+ http.Agent 负责管理 HTTP clients 的 connection persistence and reuse.
+ http.ClientRequest 用于创建一个 http client request，通过调用 `http.request()` 创建并返回, 这是一个 stream (确切说是 writable，调用 write()/end() 可以向server发送数据)
+ http.Server 用于创建一个 http Server 由 `http.createServer()` 创建并返回
+ http.ServerResponse 由 http.Server 内部创建，作为 request 事件的第二个参数，作为 client 的 response。 这是一个 writable stream.
+ http.IncomingMessage 由 http.Server 或 http.ClientRequest 创建，分别用于表示接收到的 client request 和 server response。这是一个 readable stream。

## http.Agent

## http.ClientRequest

+ extends `<Stream>`

这个对象由 `http.request()` 内部创建并返回，它表示正在进行中的请求(请求头已进入队列)，通常由 client 端发起，表示一个具体的请求。请求头仍然可以使用 `setHeader()`、`getHeader()`、
`removeHeader()` 进行改变。实际的请求头会与第一个数据块一起发送 或者 调用 `request.end()` 时发送。

当接收到 response headers 时，clientRequest 对象就会触发 'response' 事件，对应事件处理函数接收一个 `http.IncomingMessage` 的对象。在 response 事件期间，可以在响应对象上添加事件监听器，比如监听 'data' 事件，这样就能获取到具体的 response data。

```js
const http = require('http');

// 请求指定的 server，并接收数据
const clientRequest = http.request();

clientRequest.setHeader();

clientRequest.on('response', (incomingMessage) => {
  // 这边的 incomingMessage 是 http.IncomingMessage 类型
  console.log('receive response header');
  incomingMessage.on('data', data => {
    console.log('client receive res:', data);
  })
});
```

如果没有为 clientRequest 对象监听 'response' 事件，会导致响应信息被完全地丢弃。如果添加了 'response' 事件，那么 IncomingMessage 中的数据就必须被消费 (当 'readable' 事件被触发时调用 `response.read()` 或添加 'data' 事件监听器，或者调用 `.resume()` 方法)。在数据被完全消费之前，是不会触发 'end' 事件。

## http.Server

+ extends `<net.Server>`

用于创建一个 http server。

## http.ServerResponse

+ extends `<Stream>`

这个对象由 HTTP server 在内部创建，而不是由应用程序创建。它会作为第二个参数传递给 'request' 事件.

```js
const server = http.createServer();
server.on('request', (req, res) => {
  // 第一个参数 req 是 http.IncomingMessage 类型
  // 第二个参数 res 就是 http.ServerResponse 类型
})
```

## http.incomingMessage

这个类对象由 `http.Server` 或 `http.ClientRequest` 创建，分别作为第一个参数传递给 'request' (看上面的例子) 和 'response' 事件。

## http.METHODS

+ `<Array>`

A list of the HTTP methods that are supported by the parser. ('GET'/'POST'/'DELETE'/'PUT' 等)

## http.STATUS_CODES

+ `<Object>`

一个包含所有标准 HTTP response status codes 的对象。其中 key 是具体的 status code，value 是 code 对应的简短描述。

```js
http.STATUS_CODES[404] === 'Not Found'
```

## http.globalAgent

+ `<http.Agent>`

Agent 全局实例，作为所有 HTTP client request 的默认值

## http.maxHeaderSize

+ `<number>`

指定 HTTP headers 最大允许大小，单位是字节。默认值为 8KB, 可以使用 **--max-http-header-size** 命令行选项进行设置。也可以在创建 server 和 clientRequest 的时候，通过 maxHeaderSize option 进行设置。

## http.createServer([optioins][,requestListener])

+ options `<Object>`
   + IncomingMessage `<http.IncomingMessage>` 指定要使用的 IncomingMessage 类。对于扩展原始 IncomingMessage 很有用。默认值：IncomingMessage
   + ServerResponse `<http.ServerResponse>` 指定要使用的 ServerResponse 类。对于扩展原始 ServerResponse 很有用。默认值：ServerResponse
   + insecureHTTPParser `<boolean>` 当为 true 时，会使用不安全的 HTTP parser，这会允许可以接收无效的 HTTP headers。默认值：false
   + maxHeaderSize `<number>` 可选参数，会覆盖 **--max-http-header-size** 指定的值 (这个用于服务器接收的请求)
+ requestListener `<Function>` 这个会被自动添加到 server 对象的 'request' 事件

这个方法用于创建一个 http server 对象。

## http.request(options[, callback]) / http.request(url[, options][, callback])

+ url `<string>` | `<URL>`
+ options `<Object>`
   + agent `<http.Agent>` | `<boolean>` 控制 Agent 行为，可能的值包括：
      + undefined(default): 使用 http.globalAgent for this host and port.
      + Agent object: 显示地使用传入的 Agent
      + false：使用新建的具体默认值的 Agent
   + auth `<string>` 基本的身份验证。比如 'user:password', 用于计算 Authorization header。
+ callback 可选参数。会被作为 one-time listener 添加到 'response' 事件里。
+ Returns `<http.ClientRequest>`

这个方法用于向指定 url 发送请求，该返回最终会返回 `http.ClientRequest` 对象，这个对象是一个 writable stream，可以调用 write() / end() 方法写入请求数据 (比如文件上传)
```js
const http = require('http');
const querystring = require('querystring');

const postData = querystring.stringify({
  'msg': 'Hello World!'
});

const options = {
  hostname: 'www.google.com',
  port: 80,
  path: '/upload',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded', // 这边指定是上传文件的 content-type
    'Content-Length': Buffer.byteLength(postData)
  }
};

const clientRequest = http.request(options, (incomingMessage) => {
  console.log(`STATUS: ${incomingMessage.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(incomingMessage.headers)}`);
  incomingMessage.setEncoding('utf8');

  incomingMessage.on('data', chunk => {
    console.log(`BODY: ${chunk}`);
  });

  incomingMessage.on('end', () => {
    console.log('No more data in response.');
  });
});

clientRequest.on('error', e => {
  console.error(`problem with request: ${e.message}`);
});

clientRequest.write(postData); // 写入数据
clientRequest.end();
```

使用 http.request() 必须始终调用 end() 来表示请求的结束，即使没有数据被写入 clientRequest。而 `http.get()` 会默认调用 `request.end()`

## http.get(url[, options][, callback]) / http.get(options[, callback])

这个是 `http.request()` 的特殊情形，其中 options 的 methods 始终被设置为 'GET'。并且会自动调用 `request.end()`

```js
http.get('https://nodejs.org/dist/index.json', (res) => {
  const { statusCode, headers } = res;
  const contentType = headers['content-type'];

  let error;

  if (statusCode !== 200) {
    error = new Error(`Request Failed.\n Status code: ${statusCode}`);
  } else if (!/^application\/json/.test(contentType)) {
    error = new TypeError(`Invalid content-type.\n Expected application/json but received ${contentType}`);
  }

  if (error) {
    console.error(error.message);
    // consume response data to free up memory.
    res.resume();
    return;
  }

  res.setEncoding('utf8');

  let rawData = '';

  res.on('data', chunk => rawData += chunk);

  res.on('end', () => {
    try {
      const parsedData = JSON.parse(rawData);
      console.log(`all received data`, parsedData);
    } catch (e) {
      console.error(e.message);
    }
  })
}).on('error', e => {
  // 请求发送时出现错误会进入这边
  console.error(`Got error: ${e.message}`);
});
```
