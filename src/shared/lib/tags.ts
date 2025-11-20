export function parseTagsInput(input: string, limit = 10): string[] {
  if (!input) return []

  const tags: string[] = []
  const seen = new Set<string>()
  const tokens = input
    .split(/[\s,]+/)
    .map((token) => token.trim().replace(/^#/, ''))
    .filter(Boolean)

  for (const token of tokens) {
    if (seen.has(token)) continue
    seen.add(token)
    tags.push(token)
    if (tags.length >= limit) break
  }

  return tags
}

export function stringifyTags(tags: string[]): string {
  return tags.map((tag) => `#${tag}`).join(' ')
}
