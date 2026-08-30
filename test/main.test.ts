import {expect, test} from 'bun:test'

const {default: fencen} = await import('#src/main.ts')

test('should run', () => {
  const result = fencen()
  expect(result).toBe('fencen') // TODO Test actual functionality
})
