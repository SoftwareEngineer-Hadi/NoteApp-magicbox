import { describe, expect, it } from 'vitest'
import { sanitizePlainText } from './sanitize'

describe('sanitizePlainText', () => {
  it('trims and keeps ordinary note text', () => {
    expect(sanitizePlainText('  Need milk  ')).toBe('Need milk')
  })

  it('keeps newlines in a note body', () => {
    expect(sanitizePlainText('Buy milk\nCall bakery', true)).toBe('Buy milk\nCall bakery')
  })

  it('strips control characters and does not treat markup as a special case', () => {
    expect(sanitizePlainText('hello\u0000<script>alert(1)</script>', true)).toBe(
      'hello<script>alert(1)</script>',
    )
  })

  it('rejects a title that is only whitespace after cleaning', () => {
    expect(sanitizePlainText(' \n\t ')).toBe('')
  })

  it('drops newlines when they are not allowed', () => {
    expect(sanitizePlainText('one\ntwo')).toBe('onetwo')
  })
})
