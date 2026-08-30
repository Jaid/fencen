import type {Fence, FencePayload} from '#src/lib/types/Fence.ts'

const make = (length: number): Fence => {
  const fence = '`'.repeat(length)
  if (length === 1) {
    return {
      opener: () => fence,
      closer: () => fence,
    }
  }
  return {
    opener: () => `${fence} `,
    closer: () => ` ${fence}`,
  }
}
const escapeAttribute = (input: string) => {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}
const code: Fence = {
  opener: (payload?: FencePayload) => {
    if (payload?.language) {
      return `<code language="${escapeAttribute(payload.language)}">`
    }
    return '<code>'
  },
  closer: () => '</code>',
}
const inlineFences = [
  make(1),
  make(2),
  make(3),
  make(4),
  code,
] satisfies Array<Fence>

export default inlineFences
