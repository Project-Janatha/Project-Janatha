import React, { useState, useMemo } from 'react'
import { View, Text, Pressable } from 'react-native'
import { MapPin, Clock, Users, FileText } from 'lucide-react-native'
import AdminTable, { type Column } from './AdminTable'
import AdminDetailPanel from './AdminDetailPanel'
import AdminSearchInput from './AdminSearchInput'
import AdminInfoRow from './AdminInfoRow'
import AdminSectionHeader from './AdminSectionHeader'
import AdminUserRow from './AdminUserRow'
import ConfirmDialog from './ConfirmDialog'
import { MOCK_EVENTS, MOCK_USERS, type AdminEvent } from './mockData'
import { useDetailColors } from '../../hooks/useDetailColors'
import { useThemeContext } from '../contexts'

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function EventsTab() {
  const colors = useDetailColors()
  const { isDark } = useThemeContext()
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminEvent | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return MOCK_EVENTS
    return MOCK_EVENTS.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.centerName.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
    )
  }, [search])

  const selected = useMemo(
    () => MOCK_EVENTS.find((e) => e.id === selectedId) ?? null,
    [selectedId]
  )

  const eventAdmins = useMemo(
    () =>
      selected
        ? MOCK_USERS.filter((u) =>
            u.roles.some(
              (r) => r.resourceId === selected.id && r.role === 'event_admin'
            )
          )
        : [],
    [selected]
  )

  const columns: Column<AdminEvent>[] = [
    {
      key: 'title',
      header: 'Title',
      flex: 2,
      render: (item) => (
        <Text
          style={{
            fontFamily: 'Inter-Medium',
            fontSize: 13,
            color: colors.text,
          }}
          numberOfLines={1}
        >
          {item.title}
        </Text>
      ),
    },
    {
      key: 'center',
      header: 'Center',
      flex: 2,
      render: (item) => (
        <Text
          style={{
            fontFamily: 'Inter-Regular',
            fontSize: 13,
            color: colors.textSecondary,
          }}
          numberOfLines={1}
        >
          {item.centerName}
        </Text>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      flex: 1,
      render: (item) => (
        <Text
          style={{
            fontFamily: 'Inter-Regular',
            fontSize: 13,
            color: colors.textSecondary,
          }}
        >
          {formatDate(item.date)}
        </Text>
      ),
    },
    {
      key: 'attendees',
      header: 'Attendees',
      flex: 1,
      render: (item) => (
        <Text
          style={{
            fontFamily: 'Inter-Regular',
            fontSize: 13,
            color: colors.textSecondary,
          }}
        >
          {item.attendeeCount}
        </Text>
      ),
    },
  ]

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      {/* Left side — table area */}
      <View style={{ flex: 1, padding: 20 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter-Bold',
              fontSize: 18,
              color: colors.text,
            }}
          >
            Events ({filtered.length})
          </Text>

          <View style={{ width: 240 }}>
            <AdminSearchInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search by title, center, or location..."
            />
          </View>
        </View>

        {/* Table */}
        <AdminTable
          columns={columns}
          data={filtered}
          keyExtractor={(item) => item.id}
          selectedId={selectedId}
          onRowPress={(item) =>
            setSelectedId(item.id === selectedId ? null : item.id)
          }
        />
      </View>

      {/* Right side — detail panel */}
      {selected && (
        <AdminDetailPanel
          title={selected.title}
          onClose={() => setSelectedId(null)}
        >
          {/* Info rows */}
          <View style={{ gap: 12 }}>
            <AdminInfoRow
              icon={<Clock size={14} color={colors.textMuted} />}
              text={`${formatDate(selected.date)} · ${selected.time}`}
              colors={colors}
            />
            <AdminInfoRow
              icon={<MapPin size={14} color={colors.textMuted} />}
              text={selected.address}
              colors={colors}
            />
            <AdminInfoRow
              icon={<Users size={14} color={colors.textMuted} />}
              text={`${selected.attendeeCount} attendees`}
              colors={colors}
            />
            <AdminInfoRow
              icon={<FileText size={14} color={colors.textMuted} />}
              text={selected.description}
              colors={colors}
            />
          </View>

          {/* Delete button */}
          <View style={{ marginTop: 16 }}>
            <Pressable
              onPress={() => setDeleteTarget(selected)}
              style={{
                backgroundColor: colors.iconBoxBg,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 8,
                alignSelf: 'flex-start',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 12,
                  color: isDark ? '#F87171' : '#DC2626',
                }}
              >
                Delete
              </Text>
            </Pressable>
          </View>

          {/* Event Admins */}
          <AdminSectionHeader
            label="Event Admins"
            actionLabel="+ Assign"
            onAction={() =>
              console.log('TODO: Assign admin to', selected.title)
            }
            colors={colors}
          />
          {eventAdmins.length === 0 ? (
            <Text
              style={{
                fontFamily: 'Inter-Regular',
                fontSize: 12,
                color: colors.textMuted,
              }}
            >
              No admins assigned
            </Text>
          ) : (
            eventAdmins.map((u) => (
              <AdminUserRow
                key={u.id}
                name={`${u.firstName} ${u.lastName}`}
                image={u.profileImage}
                actionLabel="Revoke"
                onAction={() =>
                  console.log('TODO: Revoke admin', u.firstName, u.lastName)
                }
                colors={colors}
                isDark={isDark}
              />
            ))
          )}

          {/* Attendees */}
          <AdminSectionHeader label="Attendees" colors={colors} />
          <Text
            style={{
              fontFamily: 'Inter-Regular',
              fontSize: 12,
              color: colors.textMuted,
            }}
          >
            Attendee list will be loaded from API
          </Text>
        </AdminDetailPanel>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          console.log('TODO: Delete event', deleteTarget?.title)
          setDeleteTarget(null)
          setSelectedId(null)
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  )
}
