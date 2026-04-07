/**
 * notificationService.test.ts
 *
 * Tests for the frontend notification service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Notification } from '../../utils/notificationService'
import {
  NotificationTypes,
  getNotificationTypeName,
  getNotificationTypeIcon,
  filterNotificationsByType,
  getUnreadNotifications,
  sortNotificationsByDate,
} from '../../utils/notificationService'

describe('Notification Service', () => {
  describe('Notification Type Names', () => {
    it('should return correct names for notification types', () => {
      expect(getNotificationTypeName(NotificationTypes.EVENT_REMINDER)).toBe('Event Reminder')
      expect(getNotificationTypeName(NotificationTypes.EVENT_CREATED)).toBe('Event Created')
      expect(getNotificationTypeName(NotificationTypes.EVENT_CANCELLED)).toBe('Event Cancelled')
      expect(getNotificationTypeName(NotificationTypes.EVENT_UPDATED)).toBe('Event Updated')
      expect(getNotificationTypeName(NotificationTypes.ATTENDEE_JOINED)).toBe('Attendee Joined')
      expect(getNotificationTypeName(NotificationTypes.CENTER_ANNOUNCEMENT)).toBe('Center Announcement')
      expect(getNotificationTypeName(NotificationTypes.SYSTEM_NOTIFICATION)).toBe('System Notification')
    })

    it('should return default name for unknown type', () => {
      expect(getNotificationTypeName(999)).toBe('Notification')
    })
  })

  describe('Notification Type Icons', () => {
    it('should return correct icons for notification types', () => {
      expect(getNotificationTypeIcon(NotificationTypes.EVENT_REMINDER)).toBe('bell')
      expect(getNotificationTypeIcon(NotificationTypes.EVENT_CREATED)).toBe('calendar-plus')
      expect(getNotificationTypeIcon(NotificationTypes.EVENT_CANCELLED)).toBe('calendar-minus')
      expect(getNotificationTypeIcon(NotificationTypes.EVENT_UPDATED)).toBe('calendar-edit')
      expect(getNotificationTypeIcon(NotificationTypes.ATTENDEE_JOINED)).toBe('user-plus')
      expect(getNotificationTypeIcon(NotificationTypes.CENTER_ANNOUNCEMENT)).toBe('megaphone')
      expect(getNotificationTypeIcon(NotificationTypes.SYSTEM_NOTIFICATION)).toBe('info')
    })

    it('should return default icon for unknown type', () => {
      expect(getNotificationTypeIcon(999)).toBe('bell')
    })
  })

  describe('Notification Filtering', () => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        userId: 'user-1',
        typeId: NotificationTypes.EVENT_CREATED,
        title: 'New Event',
        message: 'A new event was created',
        data: null,
        isRead: false,
        isArchived: false,
        readAt: null,
        actionUrl: null,
        relatedEventId: 'event-1',
        relatedUserId: null,
        createdAt: '2026-04-07T10:00:00Z',
        updatedAt: '2026-04-07T10:00:00Z',
      },
      {
        id: '2',
        userId: 'user-1',
        typeId: NotificationTypes.EVENT_REMINDER,
        title: 'Event Reminder',
        message: 'Your event starts soon',
        data: null,
        isRead: true,
        isArchived: false,
        readAt: '2026-04-07T10:05:00Z',
        actionUrl: null,
        relatedEventId: 'event-2',
        relatedUserId: null,
        createdAt: '2026-04-07T09:00:00Z',
        updatedAt: '2026-04-07T10:05:00Z',
      },
      {
        id: '3',
        userId: 'user-1',
        typeId: NotificationTypes.EVENT_CREATED,
        title: 'Another Event',
        message: 'Another event was created',
        data: null,
        isRead: false,
        isArchived: false,
        readAt: null,
        actionUrl: null,
        relatedEventId: 'event-3',
        relatedUserId: null,
        createdAt: '2026-04-07T11:00:00Z',
        updatedAt: '2026-04-07T11:00:00Z',
      },
    ]

    it('should filter notifications by type', () => {
      const filtered = filterNotificationsByType(
        mockNotifications,
        NotificationTypes.EVENT_CREATED
      )

      expect(filtered).toHaveLength(2)
      expect(filtered.every((n) => n.typeId === NotificationTypes.EVENT_CREATED)).toBe(true)
    })

    it('should return empty array when no notifications match type', () => {
      const filtered = filterNotificationsByType(
        mockNotifications,
        NotificationTypes.CENTER_ANNOUNCEMENT
      )

      expect(filtered).toHaveLength(0)
    })

    it('should get unread notifications', () => {
      const unread = getUnreadNotifications(mockNotifications)

      expect(unread).toHaveLength(2)
      expect(unread.every((n) => !n.isRead)).toBe(true)
    })

    it('should return empty array when all notifications are read', () => {
      const allRead = mockNotifications.map((n) => ({ ...n, isRead: true }))
      const unread = getUnreadNotifications(allRead)

      expect(unread).toHaveLength(0)
    })
  })

  describe('Notification Sorting', () => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        userId: 'user-1',
        typeId: NotificationTypes.EVENT_CREATED,
        title: 'Old Event',
        message: 'Old event',
        data: null,
        isRead: false,
        isArchived: false,
        readAt: null,
        actionUrl: null,
        relatedEventId: 'event-1',
        relatedUserId: null,
        createdAt: '2026-04-07T08:00:00Z',
        updatedAt: '2026-04-07T08:00:00Z',
      },
      {
        id: '2',
        userId: 'user-1',
        typeId: NotificationTypes.EVENT_REMINDER,
        title: 'Recent Event',
        message: 'Recent event',
        data: null,
        isRead: true,
        isArchived: false,
        readAt: '2026-04-07T10:05:00Z',
        actionUrl: null,
        relatedEventId: 'event-2',
        relatedUserId: null,
        createdAt: '2026-04-07T10:00:00Z',
        updatedAt: '2026-04-07T10:05:00Z',
      },
      {
        id: '3',
        userId: 'user-1',
        typeId: NotificationTypes.EVENT_CREATED,
        title: 'Newest Event',
        message: 'Newest event',
        data: null,
        isRead: false,
        isArchived: false,
        readAt: null,
        actionUrl: null,
        relatedEventId: 'event-3',
        relatedUserId: null,
        createdAt: '2026-04-07T11:00:00Z',
        updatedAt: '2026-04-07T11:00:00Z',
      },
    ]

    it('should sort notifications by date (newest first)', () => {
      const sorted = sortNotificationsByDate(mockNotifications)

      expect(sorted[0].id).toBe('3')
      expect(sorted[1].id).toBe('2')
      expect(sorted[2].id).toBe('1')
    })

    it('should not modify original array', () => {
      const original = [...mockNotifications]
      sortNotificationsByDate(mockNotifications)

      expect(mockNotifications).toEqual(original)
    })
  })

  describe('Notification Types Enum', () => {
    it('should have all notification types defined', () => {
      expect(NotificationTypes.EVENT_REMINDER).toBe(1)
      expect(NotificationTypes.EVENT_CREATED).toBe(2)
      expect(NotificationTypes.EVENT_CANCELLED).toBe(3)
      expect(NotificationTypes.EVENT_UPDATED).toBe(4)
      expect(NotificationTypes.ATTENDEE_JOINED).toBe(5)
      expect(NotificationTypes.CENTER_ANNOUNCEMENT).toBe(6)
      expect(NotificationTypes.SYSTEM_NOTIFICATION).toBe(7)
    })
  })
})
