import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const srcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const endpointFile = path.normalize(path.join(srcDir, 'core/http/endpoints.ts'))

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) return files(full)
    return /\.(ts|tsx|css)$/.test(name) ? [full] : []
  })
}

describe('client bundle hygiene', () => {
  it('keeps hosts, secrets, and HTML injection out of the client source', () => {
    const offenders: string[] = []
    for (const file of files(srcDir)) {
      if (file.endsWith('bundle-hygiene.spec.ts')) continue
      const text = readFileSync(file, 'utf8')
      const isTest = file.includes('.spec.') || file.includes(`${path.sep}test${path.sep}`)
      if (/https?:\/\//.test(text) || /console\./.test(text) || /dangerouslySetInnerHTML/.test(text)) {
        offenders.push(file)
      }
      if (/OPENAI|API_KEY|sk-/.test(text)) offenders.push(file)
      if (!isTest && path.normalize(file) !== endpointFile && text.includes('/api/')) offenders.push(file)
    }
    expect(offenders).toEqual([])
  })
})
