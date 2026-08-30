import type {Fence} from '#src/lib/types/Fence.ts'

import blockFences from '#src/blockFences.ts'
import inlineFences from '#src/inlineFences.ts'

const lineBreakPattern = /\r\n|[\n\r\u2028\u2029]/u
const getDelimiter = (fence: Fence) => {
  return fence.opener().trimEnd()
}
const isCodeFence = (fence: Fence) => {
  return getDelimiter(fence) === '<code>'
}
const isCodeFenceSafe = (input: string) => {
  return !input.includes('<code>') && !input.includes('</code>')
}
const isBlockFenceSafe = (input: string, fence: Fence) => {
  if (isCodeFence(fence)) {
    return isCodeFenceSafe(input)
  }
  const delimiter = getDelimiter(fence)
  for (const line of input.split(lineBreakPattern)) {
    const lineWithoutIndentation = line.replace(/^ {0,3}/u, '')
    if (lineWithoutIndentation.startsWith(delimiter)) {
      return false
    }
  }
  return true
}
const isInlineFenceSafe = (input: string, fence: Fence) => {
  if (isCodeFence(fence)) {
    return isCodeFenceSafe(input)
  }
  return !input.includes(getDelimiter(fence))
}

export const pickFence = (input: string, inline = false, language?: string): Fence => {
  let fences = blockFences
  if (inline) {
    fences = language ? inlineFences.slice(-1) : inlineFences
  }
  for (const fence of fences) {
    const isSafe = inline ? isInlineFenceSafe(input, fence) : isBlockFenceSafe(input, fence)
    if (isSafe) {
      return fence
    }
  }
  throw new RangeError('No safe fence is available.')
}
