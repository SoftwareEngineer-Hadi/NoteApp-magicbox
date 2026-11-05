export const limits = {
  titleMax: 120,
  bodyMax: 8000,
  questionMax: 500,
  searchMax: 200,
  emailMax: 254,
  passwordMax: 200,
} as const

function isBlockedControl(code: number, allowNewlines: boolean): boolean {
  if (code === 127) return true
  if (code >= 32) return false
  if (allowNewlines && (code === 9 || code === 10 || code === 13)) return false
  return true
}

export function stripControlChars(value: string, allowNewlines = false): string {
  let cleaned = ''
  for (const char of value) {
    if (isBlockedControl(char.charCodeAt(0), allowNewlines)) continue
    cleaned += char
  }
  return cleaned
}

export function sanitizePlainText(value: string, allowNewlines = false): string {
  return stripControlChars(value, allowNewlines).trim()
}
