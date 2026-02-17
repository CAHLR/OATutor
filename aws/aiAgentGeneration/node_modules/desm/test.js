import test from 'tape'
import desm from './index.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import {
  dirname as urlDirname,
  filename,
  join as urlJoin
} from './index.js'

test('carbon copy', async ({ is }) => {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)

  is(desm(import.meta.url), __dirname)
  is(urlDirname(import.meta.url), __dirname)
  is(filename(import.meta.url), __filename)
})

test('join stuff', async ({ is }) => {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)

  is(urlJoin(import.meta.url, 'routes'), join(__dirname, 'routes'))
})

test('join stuff (concat)', async ({ is }) => {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)

  is(urlJoin(import.meta.url, '..', 'routes'), join(__dirname, '..', 'routes'))
})
