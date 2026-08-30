import {pickFence} from '#src/pickFence.ts'

export {default as blockFences} from '#src/blockFences.ts'
export {default as inlineFences} from '#src/inlineFences.ts'
export type {Fence, FencePayload} from '#src/lib/types/Fence.ts'
export {pickFence} from '#src/pickFence.ts'

export type TrimOptions = {
  indentation?: boolean
  lines?: boolean
  vertical?: boolean
} | boolean

export type Options = {
  inline?: 'auto' | boolean
  language?: string
  trim?: TrimOptions
}

type ResolvedTrimOptions = {
  indentation: boolean
  lines: boolean
  vertical: boolean
}

type Line = {
  content: string
  lineBreak: string
}

const lineBreakPattern = /\r\n|[\n\r\u2028\u2029]/gu
const lineBreakSearchPattern = /\r\n|[\n\r\u2028\u2029]/u
const whitespaceOnlyPattern = /^\s*$/u
const resolveTrimOptions = (options: TrimOptions = true): ResolvedTrimOptions => {
  if (typeof options === 'boolean') {
    return {
      vertical: options,
      lines: false,
      indentation: false,
    }
  }
  return {
    vertical: options.vertical ?? false,
    lines: options.lines ?? false,
    indentation: options.indentation ?? false,
  }
}
const splitLines = (input: string): Array<Line> => {
  const lines: Array<Line> = []
  let start = 0
  for (const match of input.matchAll(lineBreakPattern)) {
    const index = match.index
    lines.push({
      content: input.slice(start, index),
      lineBreak: match[0],
    })
    start = index + match[0].length
  }
  lines.push({
    content: input.slice(start),
    lineBreak: '',
  })
  return lines
}
const getSharedIndentationLength = (lines: Array<Line>) => {
  const contentLines = lines.filter(line => !whitespaceOnlyPattern.test(line.content))
  if (contentLines.length === 0) {
    return 0
  }
  return Math.min(...contentLines.map(line => /^\s*/u.exec(line.content)![0].length))
}
const trimInput = (input: string, options: TrimOptions = true) => {
  const resolved = resolveTrimOptions(options)
  if (!resolved.vertical && !resolved.lines && !resolved.indentation) {
    return input
  }
  const lines = splitLines(input)
  if (resolved.lines) {
    for (const line of lines) {
      line.content = line.content.trimEnd()
    }
  }
  if (resolved.vertical) {
    while (lines.length > 0 && whitespaceOnlyPattern.test(lines[0].content)) {
      lines.shift()
    }
    while (lines.length > 0 && whitespaceOnlyPattern.test(lines.at(-1)!.content)) {
      lines.pop()
    }
    if (lines.length > 0) {
      lines.at(-1)!.lineBreak = ''
    }
  }
  if (resolved.indentation) {
    const sharedIndentationLength = getSharedIndentationLength(lines)
    if (sharedIndentationLength > 0) {
      for (const line of lines) {
        line.content = line.content.slice(sharedIndentationLength)
      }
    }
  }
  return lines.map(line => line.content + line.lineBreak).join('')
}
const shouldUseInlineFence = (input: string, inline: Options['inline'], language?: string) => {
  if (inline === 'auto') {
    return !lineBreakSearchPattern.test(input)
  }
  return inline ?? false
}
const fencen = (input: string, options: Options = {}) => {
  const content = trimInput(input, options.trim)
  const inline = shouldUseInlineFence(content, options.inline, options.language)
  const fence = pickFence(content, inline, options.language)
  const opener = fence.opener({language: options.language})
  const closer = fence.closer()
  return `${opener}${content}${closer}`
}

export default fencen
