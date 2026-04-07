import React, { useState, useMemo } from 'react'
import { View, Text, Pressable } from 'react-native'
import { MapPin, Globe, Phone, User } from 'lucide-react-native'
import AdminTable, { type Column } from './AdminTable'
import AdminDetailPanel from './AdminDetailPanel'
import AdminSearchInput from './AdminSearchInput'
import AdminInfoRow from './AdminInfoRow'
import AdminSectionHeader from './AdminSectionHeader'
import AdminUserRow from './AdminUserRow'
import ConfirmDialog from './ConfirmDialog'
import { MOCK_CENTERS, MOCK_USERS, type AdminCenter } from './mockData'
import { useDetailColors } from '../../hooks/useDetailColors'
import { useThemeContext } from '../contexts'

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
            <AdminInfoRow
              icon={<MapPin size={14} color={colors.textMuted} />}
              text={`${selected.address}, ${selected.city}, ${selected.state}`}
              colors={colors}
            />
            <AdminInfoRow
              icon={<Globe size={14} color={colors.textMuted} />}
              text={selected.website}
              colors={colors}
            />
            <AdminInfoRow
              icon={<Phone size={14} color={colors.textMuted} />}
              text={selected.phone}
              colors={colors}
            />
            <AdminInfoRow
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
              onPress={() => console.log('TODO: Edit', selected.name)}
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
                console.log('TODO:', selected.isVerified ? 'Unverify' : 'Verify', selected.name)
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
          <AdminSectionHeader
            label="Center Admins"
            actionLabel="+ Assign"
            onAction={() => console.log('TODO: Assign admin to', selected.name)}
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

          {/* Members */}
          <AdminSectionHeader label="Members" colors={colors} />
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
              <AdminUserRow
                key={u.id}
                name={`${u.firstName} ${u.lastName}`}
                image={u.profileImage}
                actionLabel="Remove"
                onAction={() =>
                  console.log('TODO: Remove member', u.firstName, u.lastName)
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
          console.log('TODO: Delete center', deleteTarget?.name)
          setDeleteTarget(null)
          setSelectedId(null)
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  )
}
