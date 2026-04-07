import { describe, it, expect } from 'vitest'
import { centerGroupLabel, extractCountryAndState } from '../../utils/addressParsing'

describe('extractCountryAndState', () => {
  it('parses US addresses with ST - ZIP, US', () => {
    expect(extractCountryAndState('3511 Pontius Ct, Ijamsville, MD - 21754, US')).toEqual({
      country: 'United States',
      state: 'Maryland',
    })
    expect(extractCountryAndState('Chinmaya Mission NW Arkansas, 4000 SW Banbury Dr, Bentonville, AR - 72712, US')).toEqual({
      country: 'United States',
      state: 'Arkansas',
    })
    expect(extractCountryAndState('325 S El Dorado, MESA, AZ - 85202, US')).toEqual({
      country: 'United States',
      state: 'Arizona',
    })
  })

  it('treats Canada country code CA as Canada when province is Canadian', () => {
    expect(
      extractCountryAndState('8 Seasons Dr, Toronto, ON - M1X 1X4, CA')
    ).toEqual({ country: 'Canada', state: 'Ontario' })
  })

  it('treats Canada country code CA as US California when last segment is CA', () => {
    expect(extractCountryAndState('10160 Clayton Rd, San Jose, CA')).toEqual({
      country: 'United States',
      state: 'California',
    })
  })

  it('groups Canadian centers with wrong , US suffix', () => {
    expect(extractCountryAndState('155 E 54th Ave, Vancouver, BC - V5X 1K7, US')).toEqual({
      country: 'Canada',
      state: 'British Columbia',
    })
    expect(extractCountryAndState('1088 Ogilvie Rd, Ottawa, ON - K1J 7P8, US')).toEqual({
      country: 'Canada',
      state: 'Ontario',
    })
  })

  it('parses Canadian ON postal without country suffix', () => {
    expect(extractCountryAndState('917-B Nippissing Road, Milton, ON L9T 5E3')).toEqual({
      country: 'Canada',
      state: 'Ontario',
    })
  })

  it('parses US WA 98033, US', () => {
    expect(extractCountryAndState('7525 132nd avenue NE, Kirkland, WA 98033, US')).toEqual({
      country: 'United States',
      state: 'Washington',
    })
  })

  it('parses CO with empty zip and lowercase co (prod Trinidad / Colorado examples)', () => {
    expect(
      extractCountryAndState('#1 Swami Chinmayananada Dr., Calcutta Rd #1, McBean, CO - , US')
    ).toEqual({ country: 'United States', state: 'Colorado' })
    expect(extractCountryAndState('Rd #1 Mc Bean Couva, Couva, Co - 01234, US')).toEqual({
      country: 'United States',
      state: 'Colorado',
    })
  })

  it('merges Trinidad seed centers into one Colorado section label', () => {
    const a = centerGroupLabel('#1 Swami Chinmayananada Dr., Calcutta Rd #1, McBean, CO - , US')
    const b = centerGroupLabel('Rd #1 Mc Bean Couva, Couva, Co - 01234, US')
    expect(a).toBe('Colorado')
    expect(b).toBe('Colorado')
    expect(a).toBe(b)
  })

  it('normalizes lowercase country code', () => {
    expect(extractCountryAndState('8 Seasons Dr, Toronto, ON - M1X 1X4, ca')).toEqual({
      country: 'Canada',
      state: 'Ontario',
    })
    expect(extractCountryAndState('325 S El Dorado, MESA, AZ - 85202, us')).toEqual({
      country: 'United States',
      state: 'Arizona',
    })
  })
})
