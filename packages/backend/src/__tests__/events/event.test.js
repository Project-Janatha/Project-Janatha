import { beforeEach, describe, expect, it, vi } from 'vitest'
import eventStorage from '../../../events/eventStorage.js'
import db from '../../../database/dynamoHelpers.js'

vi.mock('../../../events/event.js', () => ({
  default: {},
}))

vi.mock('../../../profiles/user.js', () => ({
  default: {},
}))

vi.mock('../../../profiles/center.js', () => ({
  default: {},
}))

vi.mock('../../../authentication/authenticateMethods.js', () => ({
  default: {},
}))

vi.mock('../../../database/dynamoHelpers.js', () => ({
  default: {
    getEventById: vi.fn(),
    createEvent: vi.fn(),
    updateEvent: vi.fn(),
    deleteEvent: vi.fn(),
  },
}))

describe('Event Storage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('storeEvent stores a new event successfully', async () => {
    const mockEvent = {
      id: 1,
      center: { centerID: 1 },
      toJSON: vi.fn(() => ({ id: 1, title: 'Test Event' })),
    }

    db.getEventById.mockResolvedValue(null)
    db.createEvent.mockResolvedValue({ success: true })

    const result = await eventStorage.storeEvent(mockEvent)

    expect(result).toBe(true)
    expect(db.getEventById).toHaveBeenCalledWith(1)
    expect(db.createEvent).toHaveBeenCalledWith({
      eventID: 1,
      eventObject: { id: 1, title: 'Test Event' },
      centerID: 1,
    })
  })

  it('storeEvent fails if event already exists', async () => {
    const mockEvent = {
      id: 1,
      center: { centerID: 1 },
      toJSON: vi.fn(() => ({ id: 1, title: 'Test Event' })),
    }

    db.getEventById.mockResolvedValue({ id: 1 })

    const result = await eventStorage.storeEvent(mockEvent)

    expect(result).toBe(false)
    expect(db.getEventById).toHaveBeenCalledWith(1)
    expect(db.createEvent).not.toHaveBeenCalled()
  })
})
