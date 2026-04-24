import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { MapPin, Globe, Phone, User } from 'lucide-react-native'
import AdminTable, { type Column } from './AdminTable'
import AdminDetailPanel from './AdminDetailPanel'
import AdminSearchInput from './AdminSearchInput'
import AdminInfoRow from './AdminInfoRow'
import AdminSectionHeader from './AdminSectionHeader'
import AdminUserRow from './AdminUserRow'
import ConfirmDialog from './ConfirmDialog'
import {
  fetchAdminCenters,
  fetchAdminCenterMembers,
  adminVerifyCenter,
  adminDeleteCenter,
  type CenterData,
  type UserData,
} from '../../utils/api'
import { useDetailColors } from '../../hooks/useDetailColors'
import { useTheme } from '../contexts'

export default function CentersTab() {
  const colors = useDetailColors()
  const { isDark } = useTheme()
  const [search, setSearch] = useState('')
  const [centers, setCenters] = useState<CenterData[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CenterData | null>(null)
  const [members, setMembers] = useState<UserData[]>([])
  const [membersLoading, setMembersLoading] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const loadCenters = useCallback(async (q?: string) => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchAdminCenters({ q: q || undefined, limit: 100 })
      setCenters(result.data)
      setTotal(result.total)
    } catch (err: any) {
      console.error('Failed to load centers:', err)
      setError(err?.message || 'Failed to load centers. Are you logged in?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCenters()
  }, [loadCenters])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadCenters(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, loadCenters])

  const selected = useMemo(
    () => centers.find((c) => c.centerID === selectedId) ?? null,
    [selectedId, centers]
  )

  // Load members when a center is selected
  useEffect(() => {
    if (!selected) {
      setMembers([])
      return
    }
    let cancelled = false
    setMembersLoading(true)
    fetchAdminCenterMembers(selected.centerID)
      .then((data) => {
        if (!cancelled) setMembers(data)
      })
      .catch(() => {
        if (!cancelled) setMembers([])
      })
      .finally(() => {
        if (!cancelled) setMembersLoading(false)
      })
    return () => { cancelled = true }
  }, [selected])

  const renderStatus = (isVerified: boolean) => {
    const bg = isVerified
      ? isDark ? 'rgba(22,101,52,0.3)' : '#ECFDF5'
      : isDark ? 'rgba(113,63,18,0.3)' : '#FFFBEB'
    const textColor = isVerified
      ? isDark ? '#4ade80' : '#059669'
      : isDark ? '#fbbf24' : '#D97706'

    return (
      <View style={{ alignSelf: 'flex-start', backgroundColor: bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 }}>
        <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 10, color: textColor }}>
          {isVerified ? 'Verified' : 'Pending'}
        </Text>
      </View>
    )
  }

  const handleVerify = async () => {
    if (!selected) return
    try {
      await adminVerifyCenter(selected.centerID)
      loadCenters(search)
    } catch (err) {
      console.error('Failed to toggle verification:', err)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await adminDeleteCenter(deleteTarget.centerID)
      setDeleteTarget(null)
      setSelectedId(null)
      loadCenters(search)
    } catch (err) {
      console.error('Failed to delete center:', err)
    }
  }

  const columns: Column<CenterData>[] = [
    {
      key: 'name',
      header: 'Name',
      flex: 2,
      render: (item) => (
        <Text style={{ fontFamily: 'Inter-Medium', fontSize: 13, color: colors.text }} numberOfLines={1}>
          {item.name}
        </Text>
      ),
    },
    {
      key: 'address',
      header: 'Address',
      flex: 2,
      render: (item) => (
        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: colors.textSecondary }} numberOfLines={1}>
          {item.address || '\u2014'}
        </Text>
      ),
    },
    {
      key: 'members',
      header: 'Members',
      flex: 1,
      render: (item) => (
        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: colors.textSecondary }}>
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

  if (loading && centers.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#E8862A" />
      </View>
    )
  }

  if (error && centers.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
        <Text style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: '#DC2626', textAlign: 'center' }}>
          {error}
        </Text>
        <Pressable onPress={() => loadCenters()} style={{ marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#E8862A', borderRadius: 8 }}>
          <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 13, color: '#fff' }}>Retry</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View style={{ flex: 1, padding: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontFamily: 'Inter-Bold', fontSize: 18, color: colors.text }}>
            Centers ({total})
          </Text>
          <View style={{ width: 260 }}>
            <AdminSearchInput value={search} onChangeText={setSearch} placeholder="Search centers..." />
          </View>
        </View>

        <AdminTable
          columns={columns}
          data={centers}
          keyExtractor={(item) => item.centerID}
          selectedId={selectedId}
          onRowPress={(item) => setSelectedId(item.centerID === selectedId ? null : item.centerID)}
        />
      </View>

      {selected && (
        <AdminDetailPanel title={selected.name} onClose={() => setSelectedId(null)}>
          <View style={{ gap: 12 }}>
            {selected.address && (
              <AdminInfoRow icon={<MapPin size={14} color={colors.textMuted} />} text={selected.address} colors={colors} />
            )}
            {selected.website && (
              <AdminInfoRow icon={<Globe size={14} color={colors.textMuted} />} text={selected.website} colors={colors} />
            )}
            {selected.phone && (
              <AdminInfoRow icon={<Phone size={14} color={colors.textMuted} />} text={selected.phone} colors={colors} />
            )}
            {selected.acharya && (
              <AdminInfoRow icon={<User size={14} color={colors.textMuted} />} text={selected.acharya} colors={colors} />
            )}
          </View>

          <View style={{ marginTop: 16 }}>{renderStatus(selected.isVerified)}</View>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
            <Pressable
              onPress={handleVerify}
              style={{ backgroundColor: colors.iconBoxBg, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 }}
            >
              <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 12, color: colors.text }}>
                {selected.isVerified ? 'Unverify' : 'Verify'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setDeleteTarget(selected)}
              style={{ backgroundColor: colors.iconBoxBg, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 }}
            >
              <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 12, color: isDark ? '#F87171' : '#DC2626' }}>
                Delete
              </Text>
            </Pressable>
          </View>

          <AdminSectionHeader label="Members" colors={colors} />
          {membersLoading ? (
            <ActivityIndicator size="small" color="#E8862A" />
          ) : members.length === 0 ? (
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: colors.textMuted }}>
              No members
            </Text>
          ) : (
            members.map((u) => (
              <AdminUserRow
                key={u.id}
                name={`${u.firstName} ${u.lastName}`}
                image={u.profileImage}
                colors={colors}
                isDark={isDark}
              />
            ))
          )}
        </AdminDetailPanel>
      )}

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Delete Center"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  )
}
