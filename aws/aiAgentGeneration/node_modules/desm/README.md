# desm

The missing one-liner utility to get the dirname from `import.meta.url`.

Requires Node 12.17.0 or Node 14.0.0.

## Install

```
npm i desm
```

## Usage

```js
import desm from 'desm'

console.log(desm(import.meta.url))
```

or

```js
import { dirname, filename, join } from 'desm'

// same as CommonJS __dirname
console.log(dirname(import.meta.url))

// same as CommonJS __filename
console.log(filename(import.meta.url))

// same as CommonJS path.join(__dirname, 'routes')
console.log(join(import.meta.url, 'routes'))

// same as CommonJS path.join(__dirname, '..', 'other')
console.log(join(import.meta.url, '..', 'other'))
```

## License

MIT
