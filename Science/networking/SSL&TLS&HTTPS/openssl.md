openssl
=========================

## 证书生成示例

下面以实际的例子来看看怎么生成证书。

### 文件描述

+ 私钥文件：这个是必须
+ csr 文件：certificate Signing Request, 这个是 CA 对证书进行签名所需要的文件，申请证书时需要发送该文件；这个文件由 私钥文件 生成，包含公钥、CN(common name) 等其他跟证书申请者有关的信息
+ 证书文件：由 CA 或者 自签名得到的文件，这个文件包含了证书签名、摘要算法、证书有效期等信息。申请者得到这个文件后，就会部署到网站，之后发送给客户端。

### 生成CA的私钥和证书

```sh
#创建一个cert目录，后续操作都在该目录下进行
$ mkdir cert && cd cert

$ openssl req -newkey rsa:2048 -nodes -sha256 -keyout ca.key -x509 -days 365 -out ca.crt

```

+ -newkey rsa:2048: 生成一个长度为2048的采用RSA算法的私钥
+ -nodes：这个私钥在本地存储的时候不加密 (可以通过其他参数来加密私钥，确保存储更安全)
+ -sha256: 生成的证书里面采用 sha256 摘要算法
+ -keyout ca.key: 输出私钥到 ca.key 文件
+ -x509：生成证书格式为 x509，目前 TLS 默认只支持这种格式的证书
+ -days 365：证书有效期是1年
+ -out ca.crt: 生成的证书保存到 ca.crt 文件中

> 生成的过程中要求填一些信息，其中 Common Name 要填写网站域名，这个要特别注意，否则后面校验证书会失败

__注意：__ 如果是交给商业 CA 进行签名，就不需要这步操作; 如果是内部或者开发使用，使用这种方式，带上 -x509 表示是自签名证书，就可以了

### 生成私钥和证书申请文件 (certificate Signing Request)

```sh
$ openssl req -newkey rsa:2048 -nodes -sha256 -keyout domain.key -new -out domain.csr
```

和上面的区别是，这边使用 -new 生成一个证书签名申请文件，而上面用 -x509 生成一个自签名文件

从这边可以看出，CA 的私钥和普通人的私钥没有区别，唯一区别是 CA 用私钥自签名的证书受别人相信，而普通人的自签名证书别人不信，所以需要用 CA 来给证书签名

__注意：__ 采用商业 CA 进行签名，才需要这一步，如果是开发或者内部使用，只需要通过 -x509 生成自签名文件即可

### 使用 CA 私钥对申请文件进行签名

```sh
$ openssl x509 -CA ca.crt -CAkey ca.key -in domain.csr -req -days 365 -out domain.crt -CAcreateserial -sha256
```

由于需要往生成的证书里写入签名者的信息，所以需要加上 ca.crt, 这个里面有 CA 的描述信息，ca.key 里只有 CA 私钥信息。

__注意：__ 商业 CA 签名的话，这步也不需要，由 CA 签名后发回证书就行

### 查看证书内容

上面生成的证书都是 pem 格式。通过下面的命令可以查看证书内容

```sh
openssl x509 -text -noout -in ca.crt
openssl x509 -text -noout -in domain.crt
```

### 程序支持 TLS 需要哪些文件

对于服务端而已，至少需要自己的私钥和证书，也就是 domain.key 和 domain.crt

对于客户端而已，至少需要一个 CA 证书，即 ca.crt，不然无法验证服务器的证书是否正确

## 参考引用

[OpenSSL Essentials: Working with SSL Certificates, Private Keys and CSRs](https://www.digitalocean.com/community/tutorials/openssl-essentials-working-with-ssl-certificates-private-keys-and-csrs)

[OpenSSL Essentials](https://www.digitalocean.com/community/tutorials/openssl-essentials-working-with-ssl-certificates-private-keys-and-csrs#about-certificate-signing-requests-(csrs))

-----------------------------------------------------
## 数字证书

数据证书的目的是用于校验身份。SSL/TLS 协议默认只校验服务端身份，当客户端发起 SSL 握手，服务端提供证书给客户端进行校验。

### 生成证书

服务器生成公钥和私钥，并且把 公钥 发给 CA，由 CA 生成证书，证书包含 公钥、证书主体、数字签名等内容，注册成功后，CA 将证书颁发给服务器。 服务器实体拿到证书后，将证书部署到服务器端，供后续使用

### 校验证书

完成服务器这个实体的身份认证(就是到 CA 那边去注册身份信息, 这个过程叫 CSR: certificate Signing Request)

客户端拿到数字证书后，怎么确认这个证书是由CA签发

1. 首先 CA 对证书内容(包含在证书里)进行哈希算法处理生成摘要， 然后利用 CA 自己的私钥对摘要进行加密，生成数字签名内容，这个内容包含在证书里
1. 客户端拿到数字证书后，使用 CA 对外公布的公钥解密数字签名内容得到摘要；同时使用证书里提供的 哈希算法 对证书内容进行签名，然后比对摘要，如果一致就说明是对应的主体。

### 中间人劫持

数字证书是为了解决中间人劫持的问题。中间人劫持的大概流程如下：
+ 中间人创建一对 公钥/私钥 和证书；
+ 中间人拦截 client 和 server 通讯信息，对于 client 而已，中间人就是一个 server；对于 server 而已，中间人就是一个 client。
+ 当 server 向 client 发送证书时，中间人可以拦截这部分信息，然后将实际证书替换成中间人的证书发送给 client
+ 如果没有数字证书校验，那么 client 得到伪造的证书后，使用证书里的公钥跟 server 协商对称加密密钥
+ 中间人拦截交互密码的信息，使用自己的公钥解密 client 发送的信息，然后用 server 的公钥将信息加密再发送给 server
+ server 拿到信息后可以正常解密，解密后再发送信息给 client，中间人用 server 的公钥解密数据，用自己的私钥加密发送给 client
+ 在整个密钥交互过程中，中间人都可以得到交互信息。一旦密钥确认好。client 和 server 就使用约定好的算法和密钥进行数据加密通讯
+ 而中间人已经知道算法和密钥，因此client 和 server 发送的数据都可以被解密，甚至可以被篡改、伪造。

只所以中间人可以劫持成功，根本原因就是没有对中间人发送给 client 的数字证书进行验证。这也是为什么访问一些 browser 不认识的网站时，会出现警告，原因就是该网站提供的证书，浏览器认为是不是权威 CA 认证过，如果用户选择相信证书，信息就有可能被劫持。

像抓包工具，其实就是一个中间人，我们使用抓包工具抓取 https 请求，是需要先安装证书，这个证书其实就是抓包工具服务商提供的。选择使用抓包工具，就是认为抓包工具服务器提供的证书是可信。

## openssl

1. genrsa - generate an RSA certificate, this is our private key.
1. req - create a CSR
1. X509 - Sign the private key with the CSR to product a public key.