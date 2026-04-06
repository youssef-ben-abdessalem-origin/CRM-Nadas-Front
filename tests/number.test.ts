import { describe, it, expect } from 'vitest'
import { toNumber, toFixedSafe, formatCurrencyValue } from '../src/utils/number'

describe('toNumber', () => {
  it('parses numbers', () => {
    expect(toNumber(5)).toBe(5)
    expect(toNumber(3.14)).toBeCloseTo(3.14)
  })
  it('parses numeric strings', () => {
    expect(toNumber('10')).toBe(10)
    expect(toNumber('abc')).toBe(0)
  })
})

describe('toFixedSafe', () => {
  it('formats numbers with fixed decimals', () => {
    expect(toFixedSafe(12.345, 2)).toBe('12.35')
  })
})

describe('formatCurrencyValue', () => {
  it('formats USD by default', () => {
    // This test asserts the function can format a basic value
    const s = formatCurrencyValue(100, 'USD')
    expect(s).toBeTruthy()
  })
})
