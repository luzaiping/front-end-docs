# async

## returned value

async always return a promise, whether you use await or not, the promise resolves with whatever the async function returns, or rejects with whatever the async function throws.

## async syntax

### normal usage

```javascript
function wait(ms) {
  return new Promise(r => setTimeout(r,ms));
}

async function hello() {
  await wait(100);
  return 'world'
}
```

在需要异步调用的表达式前面加上 await.

### other syntax

```javascript
const jsonPromises = urls.map(async url => {
  const response = await fetch(url);
  return response.json();
})
```
在 callback 里使用

```javascript
const storage = {
  async getAvatar(name) {
    const cache = await caches.open('avatars');
    return cache.match(`/avatars/${name}.jpg`)
  }
}

storage.getAvatar('jaffathecake').then(....);
```

在 object methods 里面使用

```javascript
class Storage {
  constructor() {
    this.cachePromise = caches.open('avatars');
  }

  async getAvatar(name) {
    const cache = await this.cachePromise;
    return cache.match(`/avatars/${name}.jpg`);
  }
}

const storage = new Storage()
storage.getAvatar('jaffathecake').then(…);
```

在 class methods 里面使用

## examples

```javascript
async function logInOrder(urls) {
  const textPromises = urls.map(async url => {
    const response = await fetch(url);
    return response.text()
  })

  for (let textPromise of textPromises) {
    await textPromise;
  }
}

```

