import desm from './index.js'
import { filename, join } from './index.js'

console.log('dirname of example.js:     ' + desm(import.meta.url))
console.log('join dirname and "routes": ' + join(import.meta.url, 'routes'))
console.log('filename of example.js:    ' + filename(import.meta.url))
