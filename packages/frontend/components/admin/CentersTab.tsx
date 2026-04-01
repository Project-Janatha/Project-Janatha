import React, { useState, useMemo } from 'react'
import { View, Text, Pressable, Alert } from 'react-native'
import { MapPin, Globe, Phone, User } from 'lucide-react-native'
import AdminTable, { type Column } from './AdminTable'
import AdminDetailPanel from './AdminDetailPanel'
import AdminSearchInput from './AdminSearchInput'
import ConfirmDialog from './ConfirmDialog'
import { MOCK_CENTERS, MOCK_USERS, type AdminCenter } from './mockData'
import { useDetailColors } from '../../hooks/useDetailColors'
import { useThemeContext } from '../contexts'
import { Avatar } from '../ui'

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

export default function CentersTab() {
  const colors = useDetailColors()
  const { isDark } = useThemeContext()
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminCenter | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return MOCK_CENTERS
    return MOCK_CENTERS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q)
    )
  }, [search])

  const selected = useMemo(
    () => MOCK_CENTERS.find((c) => c.id === selectedId) ?? null,
    [selectedId]
  )

  const centerAdmins = useMemo(
    () =>
      selected
        ? MOCK_USERS.filter((u) =>
            u.roles.some(
              (r) => r.resourceId === selected.id && r.role === 'center_admin'
            )
          )
        : [],
    [selected]
  )

  const centerMembers = useMemo(
    () =>
      selected
        ? MOCK_USERS.filter((u) => u.centerId === selected.id)
        : [],
    [selected]
  )

  // Status badge helper
  const renderStatus = (isVerified: boolean) => {
    const bg = isVerified
      ? isDark
        ? 'rgba(22,101,52,0.3)'
        : '#ECFDF5'
      : isDark
        ? 'rgba(113,63,18,0.3)'
        : '#FFFBEB'
    const textColor = isVerified
      ? isDark
        ? '#4ade80'
        : '#059669'
      : isDark
        ? '#fbbf24'
        : '#D97706'

    return (
      <View
        style={{
          alignSelf: 'flex-start',
          backgroundColor: bg,
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 99,
        }}
      >
        <Text
          style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 10,
            color: textColor,
          }}
        >
          {isVerified ? 'Verified' : 'Pending'}
        </Text>
      </View>
    )
  }

  const columns: Column<AdminCenter>[] = [
    {
      key: 'name',
      header: 'Name',
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
          {item.name}
        </Text>
      ),
    },
    {
      key: 'location',
      header: 'Location',
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
          {item.city}, {item.state}
        </Text>
      ),
    },
    {
      key: 'members',
      header: 'Members',
      flex: 1,
      render: (item) => (
        <Text
          style={{
            fontFamily: 'Inter-Regular',
            fontSize: 13,
            color: colors.textSecondary,
          }}
        >
          {item.memberCount}
        </Text>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      flex: 1,
      render: (item) => renderStatus(item.isVerified),
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
            Centers ({filtered.length})
          </Text>
          <View style={{ width: 260 }}>
            <AdminSearchInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search by name, city, or state..."
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
          title={selected.name}
          onClose={() => setSelectedId(null)}
        >
          {/* Info rows */}
          <View style={{ gap: 12 }}>
            <InfoRow
              icon={<MapPin size={14} color={colors.textMuted} />}
              text={`${selected.address}, ${selected.city}, ${selected.state}`}
              colors={colors}
            />
            <InfoRow
              icon={<Globe size={14} color={colors.textMuted} />}
              text={selected.website}
              colors={colors}
            />
            <InfoRow
              icon={<Phone size={14} color={colors.textMuted} />}
              text={selected.phone}
              colors={colors}
            />
            <InfoRow
              icon={<User size={14} color={colors.textMuted} />}
              text={selected.acharya}
              colors={colors}
            />
          </View>

          {/* Status */}
          <View style={{ marginTop: 16 }}>{renderStatus(selected.isVerified)}</View>

          {/* Action buttons */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
            <Pressable
              onPress={() => Alert.alert('Edit', `Edit ${selected.name}`)}
              style={{
                backgroundColor: '#E8862A',
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 12,
                  color: '#FFFFFF',
                }}
              >
                Edit
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                Alert.alert(
                  selected.isVerified ? 'Unverify' : 'Verify',
                  `${selected.isVerified ? 'Unverify' : 'Verify'} ${selected.name}`
                )
              }
              style={{
                backgroundColor: colors.iconBoxBg,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 12,
                  color: colors.text,
                }}
              >
                {selected.isVerified ? 'Unverify' : 'Verify'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setDeleteTarget(selected)}
              style={{
                backgroundColor: colors.iconBoxBg,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 8,
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

          {/* Center Admins */}
          <SectionHeader
            label="Center Admins"
            actionLabel="+ Assign"
            onAction={() => Alert.alert('Assign Admin', `Assign admin to ${selected.name}`)}
            colors={colors}
          />
          {centerAdmins.length === 0 ? (
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
            centerAdmins.map((u) => (
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

          {/* Members */}
          <SectionHeader label="Members" colors={colors} />
          {centerMembers.length === 0 ? (
            <Text
              style={{
                fontFamily: 'Inter-Regular',
                fontSize: 12,
                color: colors.textMuted,
              }}
            >
              No members
            </Text>
          ) : (
            centerMembers.map((u) => (
              <UserRow
                key={u.id}
                name={`${u.firstName} ${u.lastName}`}
                image={u.profileImage}
                actionLabel="Remove"
                onAction={() =>
                  Alert.alert('Remove Member', `Remove ${u.firstName} ${u.lastName}`)
                }
                colors={colors}
                isDark={isDark}
              />
            ))
          )}
        </AdminDetailPanel>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Delete Center"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          Alert.alert('Deleted', `${deleteTarget?.name} deleted`)
          setDeleteTarget(null)
          setSelectedId(null)
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  )
}
