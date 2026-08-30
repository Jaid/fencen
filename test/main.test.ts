import type {Fence} from '#src/main.ts'

import {describe, expect, test} from 'bun:test'

import fencen, {blockFences, inlineFences, pickFence} from '#src/main.ts'

const pair = (fence: Fence) => {
  return [fence.opener().trimEnd(), fence.closer().trimStart()]
}
describe('blockFences', () => {
  test('contains candidates in the requested order', () => {
    expect(blockFences.map(pair)).toEqual([
      ['```', '```'],
      ['````', '````'],
      ['`````', '`````'],
      ['``````', '``````'],
      ['~~~', '~~~'],
      ['~~~~', '~~~~'],
      ['~~~~~', '~~~~~'],
      ['~~~~~~', '~~~~~~'],
      ['```````', '```````'],
      ['~~~~~~~', '~~~~~~~'],
      ['````````', '````````'],
      ['<code>', '</code>'],
    ])
  })
  test('renders language and line breaks', () => {
    expect(blockFences[0].opener({language: 'ts'})).toBe('```ts\n')
    expect(blockFences[0].closer()).toBe('\n```')
  })
})
describe('inlineFences', () => {
  test('contains spaced multi-backtick fences', () => {
    expect(inlineFences.map(fence => [fence.opener(), fence.closer()])).toEqual([
      ['`', '`'],
      ['`` ', ' ``'],
      ['``` ', ' ```'],
      ['```` ', ' ````'],
      ['<code>', '</code>'],
    ])
  })
})
describe('pickFence', () => {
  test('returns the first safe block fence by default', () => {
    expect(pair(pickFence('hello'))).toEqual(['```', '```'])
  })
  test('advances through block fences', () => {
    expect(pair(pickFence('```\n````\n`````\n``````'))).toEqual(['~~~', '~~~'])
    expect(pair(pickFence('```\n````\n`````\n``````\n~~~'))).toEqual(['~~~~', '~~~~'])
  })
  test('detects block fences indented by up to three spaces', () => {
    expect(pair(pickFence('before\n   ```\nafter'))).toEqual(['````', '````'])
  })
  test('supports different line-break styles', () => {
    expect(pair(pickFence('before\r\n```\r\nafter'))).toEqual(['````', '````'])
    expect(pair(pickFence('before\r```\rafter'))).toEqual(['````', '````'])
  })
  test('falls back to code tags for block content', () => {
    const input = [
      '```',
      '````',
      '`````',
      '``````',
      '~~~',
      '~~~~',
      '~~~~~',
      '~~~~~~',
      '```````',
      '~~~~~~~',
      '````````',
    ].join('\n')
    expect(pair(pickFence(input))).toEqual(['<code>', '</code>'])
  })
  test('throws when no block fence is safe', () => {
    const input = [
      '```',
      '````',
      '`````',
      '``````',
      '~~~',
      '~~~~',
      '~~~~~',
      '~~~~~~',
      '```````',
      '~~~~~~~',
      '````````',
      '<code>',
    ].join('\n')
    expect(() => pickFence(input)).toThrow(RangeError)
  })
  test('returns spaced inline fences after the simple candidate', () => {
    expect(pair(pickFence('hello', true))).toEqual(['`', '`'])
    const double = pickFence('hello ` world', true)
    expect([double.opener(), double.closer()]).toEqual(['`` ', ' ``'])
    expect(pair(pickFence('` `` ``` ````', true))).toEqual(['<code>', '</code>'])
  })
})
describe('TrimOptions', () => {
  test('true enables only vertical trimming', () => {
    expect(fencen('\n  hello  \n', {trim: true})).toBe('```\n  hello  \n```')
  })
  test('false preserves all input whitespace', () => {
    expect(fencen('\nhello\n', {trim: false})).toBe('```\n\nhello\n\n```')
  })
  test('lines trims line endings independently', () => {
    expect(fencen('  one  \n    two\t', {
      trim: {lines: true},
    })).toBe('```\n  one\n    two\n```')
  })
  test('indentation removes shared indentation independently', () => {
    expect(fencen('  one  \n    two\t', {
      trim: {indentation: true},
    })).toBe('```\none  \n  two\t\n```')
  })
  test('object options can combine all trimming behaviors', () => {
    const input = '\n    one  \n      two\t\n\n'
    expect(fencen(input, {
      trim: {
        vertical: true,
        lines: true,
        indentation: true,
      },
    })).toBe('```\none\n  two\n```')
  })
})
describe('fencen', () => {
  test('wraps block content', () => {
    expect(fencen('hello')).toBe('```\nhello\n```')
  })
  test('uses the selected block fence', () => {
    expect(fencen('one\n```\ntwo')).toBe('````\none\n```\ntwo\n````')
  })
  test('supports inline fences', () => {
    expect(fencen('hello', {inline: true})).toBe('`hello`')
    expect(fencen('hello ` world', {inline: true})).toBe('`` hello ` world ``')
  })
  test('uses an XML language property for inline code', () => {
    expect(fencen('const value = 1', {
      inline: true,
      language: 'ts',
    })).toBe('<code language=\"ts\">const value = 1</code>')
    expect(fencen('value', {
      inline: true,
      language: '\"ts&xml<',
    })).toBe('<code language=\"&quot;ts&amp;xml&lt;\">value</code>')
  })
  test('throws when language requires an unsafe inline XML fence', () => {
    expect(() => fencen('</code>', {
      inline: true,
      language: 'ts',
    })).toThrow(RangeError)
  })
  test('supports automatic inline selection', () => {
    expect(fencen('hello', {inline: 'auto'})).toBe('`hello`')
    expect(fencen('hello', {
      inline: 'auto',
      language: 'txt',
    })).toBe('<code language=\"txt\">hello</code>')
    expect(fencen('hello\nworld', {inline: 'auto'})).toBe('```\nhello\nworld\n```')
  })
  test('adds a language to Markdown block fences', () => {
    expect(fencen('const value = 1', {language: 'ts'})).toBe('```ts\nconst value = 1\n```')
  })
  test('preserves non-trimmed line-break styles inside content', () => {
    expect(fencen('hello\r\nworld')).toBe('```\nhello\r\nworld\n```')
  })
})
