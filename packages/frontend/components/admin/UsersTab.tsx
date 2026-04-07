import React, { useMemo, useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Mail, Building2, Calendar, Shield } from 'lucide-react-native'
import AdminTable, { type Column } from './AdminTable'
import AdminDetailPanel from './AdminDetailPanel'
import AdminSearchInput from './AdminSearchInput'
import ConfirmDialog from './ConfirmDialog'
import { MOCK_USERS, type AdminUser } from './mockData'
import { useDetailColors } from '../../hooks/useDetailColors'
import { useThemeContext } from '../contexts'
import { Avatar } from '../ui'

// ---------------------------------------------------------------------------
// Role badge config
// ---------------------------------------------------------------------------

const ROLE_COLORS = {
  super: { bg: 'rgba(232,134,42,0.2)', text: '#E8862A', label: 'Super' },
  center_admin: { bg: 'rgba(34,197,94,0.2)', text: '#22c55e', label: 'Center' },
  event_admin: { bg: 'rgba(59,130,246,0.2)', text: '#3b82f6', label: 'Event' },
}

function getRoleBadgeType(user: AdminUser): 'super' | 'center_admin' | 'event_admin' | null {
  if (user.verificationLevel >= 107)
    return 'super'
  if (user.roles.some((r) => r.role === 'center_admin')) return 'center_admin'
  if (user.roles.some((r) => r.role === 'event_admin')) return 'event_admin'
  return null
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InfoRow({
  icon,
  text,
  colors,
  textColor,
}: {
  icon: React.ReactNode
  text: string
  colors: ReturnType<typeof useDetailColors>
  textColor?: string
}) {
  return (
    <View style={infoStyles.row}>
      <View style={[infoStyles.iconBox, { backgroundColor: colors.iconBoxBg }]}>{icon}</View>
      <Text style={[infoStyles.text, { color: textColor ?? colors.textSecondary }]}>{text}</Text>
    </View>
  )
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  text: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    flex: 1,
  },
})

function SectionHeader({ label, colors }: { label: string; colors: ReturnType<typeof useDetailColors> }) {
  return (
    <Text style={[sectionStyles.label, { color: colors.textMuted }]}>{label}</Text>
  )
}

const sectionStyles = StyleSheet.create({
  label: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 10,
  },
})

function RoleRow({
  label,
  sublabel,
  onRevoke,
  colors,
  isDark,
}: {
  label: string
  sublabel: string
  onRevoke?: () => void
  colors: ReturnType<typeof useDetailColors>
  isDark: boolean
}) {
  return (
    <View style={[roleStyles.row, { backgroundColor: colors.iconBoxBg, borderRadius: 8 }]}>
      <View style={roleStyles.left}>
        <View style={[roleStyles.iconBox, { backgroundColor: colors.iconBoxBg }]}>
          <Shield size={14} color="#E8862A" />
        </View>
        <View>
          <Text style={[roleStyles.label, { color: colors.text }]}>{label}</Text>
          <Text style={[roleStyles.sublabel, { color: colors.textMuted }]}>{sublabel}</Text>
        </View>
      </View>
      {onRevoke && (
        <Pressable onPress={onRevoke}>
          <Text style={roleStyles.revokeText}>Revoke</Text>
        </Pressable>
      )}
    </View>
  )
}

const roleStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  sublabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    marginTop: 1,
  },
  revokeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#ef4444',
  },
})

// ---------------------------------------------------------------------------
// Date formatter
// ---------------------------------------------------------------------------

function formatJoinDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ---------------------------------------------------------------------------
// UsersTab
// ---------------------------------------------------------------------------

export default function UsersTab() {
  const colors = useDetailColors()
  const { isDark } = useThemeContext()

  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false)

  // --- Filtering ---
  const filtered = useMemo(() => {
    if (!search.trim()) return MOCK_USERS
    const q = search.toLowerCase()
    return MOCK_USERS.filter(
      (u) =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q),
    )
  }, [search])

  // --- Table columns ---
  const columns: Column<AdminUser>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Name',
        flex: 2,
        render: (user: AdminUser) => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar
              name={`${user.firstName} ${user.lastName}`}
              image={user.profileImage ?? undefined}
              size={22}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{ fontFamily: 'Inter-Medium', fontSize: 13, color: colors.text }}
              numberOfLines={1}
            >
              {user.firstName} {user.lastName}
            </Text>
          </View>
        ),
      },
      {
        key: 'email',
        header: 'Email',
        flex: 2,
        render: (user: AdminUser) => (
          <Text
            style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: colors.textMuted }}
            numberOfLines={1}
          >
            {user.email}
          </Text>
        ),
      },
      {
        key: 'center',
        header: 'Center',
        flex: 1.5,
        render: (user: AdminUser) => (
          <Text
            style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: colors.textMuted }}
            numberOfLines={1}
          >
            {user.centerName || '\u2014'}
          </Text>
        ),
      },
      {
        key: 'roles',
        header: 'Roles',
        flex: 1,
        render: (user: AdminUser) => {
          const badge = getRoleBadgeType(user)
          if (!badge) {
            return (
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: colors.textMuted }}>
                {'\u2014'}
              </Text>
            )
          }
          const rc = ROLE_COLORS[badge]
          return (
            <View
              style={{
                backgroundColor: rc.bg,
                paddingHorizontal: 7,
                paddingVertical: 2,
                borderRadius: 4,
                alignSelf: 'flex-start',
              }}
            >
              <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 10, color: rc.text }}>
                {rc.label}
              </Text>
            </View>
          )
        },
      },
    ],
    [colors],
  )

  // --- Actions (stubbed) ---
  const handleVerifyToggle = () => {
    if (!selectedUser) return
    console.log('TODO:', selectedUser.isVerified ? 'Unverify' : 'Verify', selectedUser.firstName, selectedUser.lastName)
  }

  const handleRemoveUser = () => {
    setConfirmDeleteVisible(true)
  }

  const handleConfirmRemove = () => {
    setConfirmDeleteVisible(false)
    if (!selectedUser) return
    console.log('TODO: Remove user', selectedUser.firstName, selectedUser.lastName)
    setSelectedUser(null)
  }

  const handleRevokeRole = (roleName: string, resourceName: string) => {
    console.log('TODO: Revoke', roleName, 'for', resourceName)
  }

  // --- Detail panel content ---
  const renderDetailContent = () => {
    if (!selectedUser) return null
    const u = selectedUser
    const badgeType = getRoleBadgeType(u)
    const isSuperAdmin = badgeType === 'super'

    return (
      <View>
        {/* User header */}
        <View style={detailStyles.userHeader}>
          <Avatar
            name={`${u.firstName} ${u.lastName}`}
            image={u.profileImage ?? undefined}
            size={56}
          />
          <Text style={[detailStyles.userName, { color: colors.text }]}>
            {u.firstName} {u.lastName}
          </Text>
          <Text style={[detailStyles.userEmail, { color: colors.textMuted }]}>{u.email}</Text>
        </View>

        {/* Info rows */}
        <View style={{ marginTop: 16 }}>
          <InfoRow
            icon={<Building2 size={14} color={colors.iconHeader} />}
            text={u.centerName || 'No center'}
            colors={colors}
          />
          <InfoRow
            icon={<Calendar size={14} color={colors.iconHeader} />}
            text={`Joined ${formatJoinDate(u.createdAt)}`}
            colors={colors}
          />
          <InfoRow
            icon={<Shield size={14} color={u.isVerified ? '#22c55e' : colors.iconHeader} />}
            text={u.isVerified ? 'Verified' : 'Not verified'}
            colors={colors}
            textColor={u.isVerified ? '#22c55e' : colors.textMuted}
          />
        </View>

        {/* Action buttons */}
        <View style={detailStyles.actions}>
          <Pressable onPress={handleVerifyToggle} style={[detailStyles.actionBtn, { backgroundColor: colors.iconBoxBg }]}>
            <Text style={[detailStyles.actionBtnText, { color: colors.text }]}>
              {u.isVerified ? 'Unverify' : 'Verify'}
            </Text>
          </Pressable>
          <Pressable onPress={handleRemoveUser} style={[detailStyles.actionBtn, { backgroundColor: colors.iconBoxBg }]}>
            <Text style={[detailStyles.actionBtnText, { color: '#ef4444' }]}>Remove User</Text>
          </Pressable>
        </View>

        {/* Roles section */}
        <SectionHeader label="Roles" colors={colors} />

        {isSuperAdmin && (
          <RoleRow
            label="Super Admin"
            sublabel="Global"
            colors={colors}
            isDark={isDark}
          />
        )}

        {u.roles.map((r, i) => {
          const roleLabel = r.role === 'center_admin' ? 'Center Admin' : 'Event Admin'
          return (
            <RoleRow
              key={`${r.role}-${r.resourceId}-${i}`}
              label={roleLabel}
              sublabel={r.resourceName}
              onRevoke={() => handleRevokeRole(roleLabel, r.resourceName)}
              colors={colors}
              isDark={isDark}
            />
          )
        })}

        {!isSuperAdmin && u.roles.length === 0 && (
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: colors.textMuted }}>
            {'\u2014'}
          </Text>
        )}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Main panel (table) */}
      <View style={styles.tablePanel}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Users ({filtered.length})</Text>
          <View style={styles.searchWrap}>
            <AdminSearchInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search users..."
            />
          </View>
        </View>

        {/* Table */}
        <AdminTable
          columns={columns}
          data={filtered}
          keyExtractor={(u) => u.id}
          selectedId={selectedUser?.id ?? null}
          onRowPress={(item) =>
            setSelectedUser(item.id === selectedUser?.id ? null : item)
          }
        />
      </View>

      {/* Detail panel */}
      {selectedUser && (
        <AdminDetailPanel
          title="User Details"
          onClose={() => setSelectedUser(null)}
        >
          {renderDetailContent()}
        </AdminDetailPanel>
      )}

      {/* Confirm delete dialog */}
      <ConfirmDialog
        visible={confirmDeleteVisible}
        title="Remove User"
        message={`Are you sure you want to remove ${selectedUser?.firstName ?? ''} ${selectedUser?.lastName ?? ''}? This action cannot be undone.`}
        confirmLabel="Remove"
        onConfirm={handleConfirmRemove}
        onCancel={() => setConfirmDeleteVisible(false)}
      />
    </View>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  tablePanel: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  searchWrap: {
    width: 240,
  },
})

const detailStyles = StyleSheet.create({
  userHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginTop: 8,
  },
  userEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
  },
})
