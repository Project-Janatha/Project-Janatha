import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react-native'
import EventDetailPage from '../../../../app/events/[id]'
// Mock expo-router
vi.mock('expo-router', () => ({
  useLocalSearchParams: vi.fn(),
  useRouter: vi.fn(),
}))

// Mock hooks
vi.mock('../../../hooks/useApiData', () => ({
  useEventDetail: vi.fn(),
}))

vi.mock('../../../components/contexts', () => ({
  useUser: vi.fn(),
}))

vi.mock('../../../hooks/useDetailColors', () => ({
  useDetailColors: vi.fn(() => ({
    panelBg: '#fff',
    text: '#000',
    textMuted: '#999',
    textSecondary: '#666',
    border: '#eee',
    iconHeader: '#333',
    iconBoxBg: '#f5f5f5',
    cardBg: '#f9f9f9',
    avatarBorder: '#ddd',
    attendedBg: '#f0fdf4',
  })),
}))

const { useLocalSearchParams, useRouter } = vi.mocked(require('expo-router'))
const { useEventDetail } = vi.mocked(require('../../../hooks/useApiData'))
const { useUser } = vi.mocked(require('../../../components/contexts'))

describe('EventDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useLocalSearchParams.mockReturnValue({ id: 'event-123' })
    useRouter.mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
    })
  })

  it('shows loading state while fetching event', () => {
    useUser.mockReturnValue({
      user: { username: 'user123', id: 'uid-1' },
      authStatus: 'authenticated',
    })
    useEventDetail.mockReturnValue({
      event: null,
      attendees: [],
      messages: [],
      loading: true,
      toggleRegistration: vi.fn(),
      isToggling: false,
      isCreator: false,
    })

    render(<EventDetailPage />)
    expect(screen.getByTestId('loading-spinner')).toBeTruthy()
  })

  it('shows "Event not found" when event is null and not loading', () => {
    useUser.mockReturnValue({
      user: { username: 'user123', id: 'uid-1' },
      authStatus: 'authenticated',
    })
    useEventDetail.mockReturnValue({
      event: null,
      attendees: [],
      messages: [],
      loading: false,
      toggleRegistration: vi.fn(),
      isToggling: false,
      isCreator: false,
    })

    render(<EventDetailPage />)
    expect(screen.getByText('Event not found')).toBeTruthy()
  })

  it('displays event details for unregistered user', () => {
    const mockEvent = {
      title: 'Yoga Session',
      date: '2026-04-15',
      time: '10:00 AM',
      location: 'Yoga Studio',
      address: '123 Main St',
      attendees: 5,
      description: 'Beginner yoga class',
      image: 'https://example.com/yoga.jpg',
      isRegistered: false,
    }

    useUser.mockReturnValue({
      user: { username: 'user123', id: 'uid-1' },
      authStatus: 'authenticated',
    })
    useEventDetail.mockReturnValue({
      event: mockEvent,
      attendees: [],
      messages: [],
      loading: false,
      toggleRegistration: vi.fn(),
      isToggling: false,
      isCreator: false,
    })

    render(<EventDetailPage />)
    expect(screen.getByText('Yoga Session')).toBeTruthy()
    expect(screen.getByText('Attend Event')).toBeTruthy()
  })

  it('shows "Cancel Registration" button for registered user', () => {
    const mockEvent = {
      title: 'Meditation Workshop',
      date: '2026-04-20',
      time: '2:00 PM',
      location: 'Community Center',
      attendees: 12,
      description: 'Guided meditation',
      image: null,
      isRegistered: true,
    }

    useUser.mockReturnValue({
      user: { username: 'user123', id: 'uid-1' },
      authStatus: 'authenticated',
    })
    useEventDetail.mockReturnValue({
      event: mockEvent,
      attendees: [{ name: 'John', initials: 'JD' }],
      messages: [],
      loading: false,
      toggleRegistration: vi.fn(),
      isToggling: false,
      isCreator: false,
    })

    render(<EventDetailPage />)
    expect(screen.getByText('Cancel Registration')).toBeTruthy()
  })

  it('hides action bar for past events', () => {
    const mockEvent = {
      title: 'Past Event',
      date: '2026-01-01',
      time: '3:00 PM',
      location: 'Old Location',
      attendees: 20,
      description: 'This event already happened',
      image: null,
      isRegistered: true,
    }

    useUser.mockReturnValue({
      user: { username: 'user123', id: 'uid-1' },
      authStatus: 'authenticated',
    })
    useEventDetail.mockReturnValue({
      event: mockEvent,
      attendees: [],
      messages: [],
      loading: false,
      toggleRegistration: vi.fn(),
      isToggling: false,
      isCreator: false,
    })

    render(<EventDetailPage />)
    expect(screen.queryByText('Attend Event')).toBeFalsy()
    expect(screen.queryByText('Cancel Registration')).toBeFalsy()
  })
})
