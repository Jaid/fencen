import type {Fence, FencePayload} from '#src/lib/types/Fence.ts'

const make = (character: '`' | '~', length: number): Fence => {
  const fence = character.repeat(length)
  return {
    opener: (payload?: FencePayload) => {
      if (payload?.language) {
        return `${fence}${payload.language}\n`
      }
      return `${fence}\n`
    },
    closer: () => {
      return `\n${fence}`
    },
  }
}
const code: Fence = {
  opener: () => '<code>\n',
  closer: () => '\n</code>',
}
const blockFences = [
  make('`', 3),
  make('`', 4),
  make('`', 5),
  make('`', 6),
  make('~', 3),
  make('~', 4),
  make('~', 5),
  make('~', 6),
  make('`', 7),
  make('~', 7),
  make('`', 8),
  code,
] satisfies Array<Fence>

export default blockFences
