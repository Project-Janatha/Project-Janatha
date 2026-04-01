import React, { useState, useMemo } from 'react'
import { View, Text, Pressable, Alert } from 'react-native'
import { MapPin, Clock, Users, FileText } from 'lucide-react-native'
import AdminTable, { type Column } from './AdminTable'
import AdminDetailPanel from './AdminDetailPanel'
import AdminSearchInput from './AdminSearchInput'
import ConfirmDialog from './ConfirmDialog'
import { MOCK_EVENTS, MOCK_USERS, type AdminEvent } from './mockData'
import { useDetailColors } from '../../hooks/useDetailColors'
import { useThemeContext } from '../contexts'
import { Avatar } from '../ui'

// --- Helpers ---

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// --- Sub-components ---

function InfoRow({
  icon,
  text,
  colors,
}: {
  icon: React.ReactNode
  text: string
  colors: ReturnType<typeof useDetailColors>
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {icon}
      <Text
        style={{
          fontFamily: 'Inter-Regular',
          fontSize: 12,
          color: colors.text,
        }}
        numberOfLines={2}
      >
        {text}
      </Text>
    </View>
  )
}

function SectionHeader({
  label,
  actionLabel,
  onAction,
  colors,
}: {
  label: string
  actionLabel?: string
  onAction?: () => void
  colors: ReturnType<typeof useDetailColors>
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 8,
      }}
    >
      <Text
        style={{
          fontFamily: 'Inter-SemiBold',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          color: colors.textMuted,
        }}
      >
        {label}
      </Text>
      {actionLabel && onAction && (
        <Pressable onPress={onAction}>
          <Text
            style={{
              fontFamily: 'Inter-SemiBold',
              fontSize: 11,
              color: '#E8862A',
            }}
          >
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  )
}

function UserRow({
  name,
  image,
  actionLabel,
  onAction,
  colors,
  isDark,
}: {
  name: string
  image: string | null
  actionLabel: string
  onAction: () => void
  colors: ReturnType<typeof useDetailColors>
  isDark: boolean
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.iconBoxBg,
        borderRadius: 8,
        padding: 8,
        marginBottom: 6,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Avatar name={name} image={image ?? undefined} size={24} />
        <Text
          style={{
            fontFamily: 'Inter-Regular',
            fontSize: 12,
            color: colors.text,
          }}
        >
          {name}
        </Text>
      </View>
      <Pressable onPress={onAction}>
        <Text
          style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 11,
            color: isDark ? '#F87171' : '#DC2626',
          }}
        >
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  )
}

// --- Main Component ---

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
            <InfoRow
              icon={<Clock size={14} color={colors.textMuted} />}
              text={`${formatDate(selected.date)} · ${selected.time}`}
              colors={colors}
            />
            <InfoRow
              icon={<MapPin size={14} color={colors.textMuted} />}
              text={selected.address}
              colors={colors}
            />
            <InfoRow
              icon={<Users size={14} color={colors.textMuted} />}
              text={`${selected.attendeeCount} attendees`}
              colors={colors}
            />
            <InfoRow
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
          <SectionHeader
            label="Event Admins"
            actionLabel="+ Assign"
            onAction={() =>
              Alert.alert('Assign Admin', `Assign admin to ${selected.title}`)
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
              <UserRow
                key={u.id}
                name={`${u.firstName} ${u.lastName}`}
                image={u.profileImage}
                actionLabel="Revoke"
                onAction={() =>
                  Alert.alert('Revoke Admin', `Revoke ${u.firstName} ${u.lastName}`)
                }
                colors={colors}
                isDark={isDark}
              />
            ))
          )}

          {/* Attendees */}
          <SectionHeader label="Attendees" colors={colors} />
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
          Alert.alert('Deleted', `${deleteTarget?.title} deleted`)
          setDeleteTarget(null)
          setSelectedId(null)
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  )
}
