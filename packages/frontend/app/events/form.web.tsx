import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  ChevronLeft,
  Type,
  FileText,
  Calendar,
  Clock,
  MapPin,
  Navigation,
  User,
  Image as ImageIcon,
  Tag,
  Building2,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react-native'
import { useUser } from '../../components/contexts'
import { useDetailColors, type DetailColors } from '../../hooks/useDetailColors'
import {
  fetchEvent,
  fetchCenters,
  createEvent,
  updateEvent,
  type CenterData,
} from '../../utils/api'

const ADMIN_EMAIL = 'chinmayajanata@gmail.com'

const CATEGORY_OPTIONS = [
  { value: undefined, label: 'None' },
  { value: 91, label: 'Satsang' },
  { value: 92, label: 'Bhiksha' },
]

// ── Field row ────────────────────────────────────────────────────────────

function FieldRow({
  icon: Icon,
  label,
  colors,
  error,
  children,
}: {
  icon: React.ElementType
  label: string
  colors: DetailColors
  error?: string
  children: React.ReactNode
}) {
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: colors.iconBoxBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={16} color="#E8862A" />
        </View>
        <Text
          style={{
            fontFamily: 'Inter-Medium',
            fontSize: 11,
            color: colors.textMuted,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Text>
      </View>
      {children}
      {error ? (
        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#DC2626', marginLeft: 42 }}>
          {error}
        </Text>
      ) : null}
    </View>
  )
}

// ── Main component ──────────────────────────────────────────────────────

export default function EventFormPage() {
  const params = useLocalSearchParams<{ id?: string }>()
  const eventId = params.id
  const isEdit = !!eventId
  const router = useRouter()
  const { user } = useUser()
  const colors = useDetailColors()
  const { width: viewportWidth } = useWindowDimensions()

  const isNarrow = viewportWidth < 768

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [centers, setCenters] = useState<CenterData[]>([])
  const [showCenterPicker, setShowCenterPicker] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [centerID, setCenterID] = useState('')
  const [centerName, setCenterName] = useState('')
  const [pointOfContact, setPointOfContact] = useState('')
  const [image, setImage] = useState('')
  const [category, setCategory] = useState<number | undefined>(undefined)

  const isAdmin = user?.email === ADMIN_EMAIL || (user?.verificationLevel !== undefined && user.verificationLevel >= 107)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        const allCenters = await fetchCenters()
        if (!mounted) return
        setCenters(allCenters)

        if (isEdit && eventId) {
          const event = await fetchEvent(eventId)
          if (!mounted) return

          if (event) {
            setTitle(event.title || '')
            setDescription(event.description || '')

            if (event.date) {
              const d = new Date(event.date)
              setDate(d.toISOString().split('T')[0])
              setTime(
                d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
              )
            }

            setAddress(event.address || '')
            setLatitude(String(event.latitude || ''))
            setLongitude(String(event.longitude || ''))
            setCenterID(event.centerID || '')
            setPointOfContact(event.pointOfContact || '')
            setImage(event.image || '')
            setCategory(event.category ?? undefined)

            const matchingCenter = allCenters.find((c) => c.centerID === event.centerID)
            if (matchingCenter) setCenterName(matchingCenter.name)
          }
        }
      } catch (err) {
        if (__DEV__) console.warn('[EventForm]', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [eventId, isEdit])

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) newErrors.title = 'Title is required'
    if (!date.trim()) newErrors.date = 'Date is required (YYYY-MM-DD)'
    if (!centerID) newErrors.center = 'Center is required'

    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    if (!latitude || isNaN(lat) || lat < -90 || lat > 90) {
      newErrors.latitude = 'Valid latitude required (-90 to 90)'
    }
    if (!longitude || isNaN(lng) || lng < -180 || lng > 180) {
      newErrors.longitude = 'Valid longitude required (-180 to 180)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [title, date, centerID, latitude, longitude])

  const buildDateISO = (): string => {
    if (!time.trim()) return `${date}T12:00:00`

    const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
    if (match) {
      let hours = parseInt(match[1], 10)
      const minutes = match[2]
      const ampm = match[3].toUpperCase()
      if (ampm === 'PM' && hours !== 12) hours += 12
      if (ampm === 'AM' && hours === 12) hours = 0
      return `${date}T${String(hours).padStart(2, '0')}:${minutes}:00`
    }

    return `${date}T12:00:00`
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)

    try {
      if (isEdit && eventId) {
        await updateEvent({
          id: eventId,
          title: title.trim(),
          description: description.trim(),
          date: buildDateISO(),
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          address: address.trim() || undefined,
          centerID,
          pointOfContact: pointOfContact.trim() || undefined,
          image: image.trim() || undefined,
          category,
        })
        alert('Event updated successfully')
      } else {
        await createEvent({
          title: title.trim(),
          description: description.trim(),
          date: buildDateISO(),
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          address: address.trim() || undefined,
          centerID,
          pointOfContact: pointOfContact.trim() || undefined,
          image: image.trim() || undefined,
          category,
        })
        alert('Event created successfully')
      }
      router.back()
    } catch (err: any) {
      alert(err?.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const selectCenter = (center: CenterData) => {
    setCenterID(center.centerID)
    setCenterName(center.name)
    if (!latitude && center.latitude) setLatitude(String(center.latitude))
    if (!longitude && center.longitude) setLongitude(String(center.longitude))
    if (!address && center.address) setAddress(center.address)
    setShowCenterPicker(false)
  }

  const inputStyle = (hasError?: boolean) => ({
    fontFamily: 'Inter-Regular' as const,
    fontSize: 15,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: hasError ? '#DC2626' : colors.border,
    backgroundColor: colors.cardBg,
    marginLeft: 42,
  })

  // ── Guard: not admin (disabled for testing) ─────────────────────────

  if (false && !isAdmin) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.panelBg, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
        <AlertTriangle size={48} color={colors.textMuted} />
        <Text
          style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 18,
            color: colors.text,
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          Admin Access Required
        </Text>
        <Text
          style={{
            fontFamily: 'Inter-Regular',
            fontSize: 14,
            color: colors.textSecondary,
            marginTop: 8,
            textAlign: 'center',
          }}
        >
          Only administrators can create or edit events.
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={{ marginTop: 24, minHeight: 44, justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#E8862A' }}>Go Back</Text>
        </Pressable>
      </View>
    )
  }

  // ── Loading ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.panelBg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E8862A" />
      </View>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: colors.panelBg }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: isNarrow ? 16 : 40,
          paddingTop: 20,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 900,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        <View style={{ gap: 4 }}>
          <Pressable
            onPress={() => router.back()}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}
          >
            <ChevronLeft size={18} color={colors.iconHeader} />
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: colors.iconHeader }}>
              Back
            </Text>
          </Pressable>
          <Text style={{ fontFamily: 'Inter-Bold', fontSize: isNarrow ? 22 : 28, color: colors.text, letterSpacing: -0.5 }}>
            {isEdit ? 'Edit Event' : 'Create Event'}
          </Text>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: colors.textMuted, marginTop: 2 }}>
            {isEdit ? 'Update event details below' : 'Fill in the details to create a new event'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          maxWidth: 900,
          width: '100%',
          alignSelf: 'center',
          padding: isNarrow ? 20 : 40,
          gap: 24,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <FieldRow icon={Type} label="Title" colors={colors} error={errors.title}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Event title"
            placeholderTextColor={colors.textMuted}
            style={inputStyle(!!errors.title)}
          />
        </FieldRow>

        {/* Description */}
        <FieldRow icon={FileText} label="Description" colors={colors}>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the event..."
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
            style={{
              ...inputStyle(),
              minHeight: 120,
            }}
          />
        </FieldRow>

        {/* Date + Time side by side */}
        <View style={{ flexDirection: isNarrow ? 'column' : 'row', gap: isNarrow ? 24 : 28 }}>
          <View style={{ flex: 1 }}>
            <FieldRow icon={Calendar} label="Date" colors={colors} error={errors.date}>
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
                style={inputStyle(!!errors.date)}
              />
            </FieldRow>
          </View>
          <View style={{ flex: 1 }}>
            <FieldRow icon={Clock} label="Time" colors={colors}>
              <TextInput
                value={time}
                onChangeText={setTime}
                placeholder="e.g. 10:30 AM"
                placeholderTextColor={colors.textMuted}
                style={inputStyle()}
              />
            </FieldRow>
          </View>
        </View>

        {/* Center selection */}
        <FieldRow icon={Building2} label="Center" colors={colors} error={errors.center}>
          <Pressable
            onPress={() => setShowCenterPicker(!showCenterPicker)}
            style={{
              ...inputStyle(!!errors.center),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter-Regular',
                fontSize: 15,
                color: centerName ? colors.text : colors.textMuted,
              }}
            >
              {centerName || 'Select a center...'}
            </Text>
            <ChevronDown
              size={16}
              color={colors.textMuted}
              style={{ transform: [{ rotate: showCenterPicker ? '180deg' : '0deg' }] }}
            />
          </Pressable>

          {showCenterPicker && (
            <View
              style={{
                marginLeft: 42,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.cardBg,
                maxHeight: 200,
                overflow: 'hidden',
              }}
            >
              <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
                {centers.map((center) => (
                  <Pressable
                    key={center.centerID}
                    onPress={() => selectCenter(center)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                      backgroundColor: center.centerID === centerID ? 'rgba(232,134,42,0.1)' : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: center.centerID === centerID ? 'Inter-Medium' : 'Inter-Regular',
                        fontSize: 14,
                        color: center.centerID === centerID ? '#E8862A' : colors.text,
                      }}
                    >
                      {center.name}
                    </Text>
                    {center.address ? (
                      <Text
                        style={{
                          fontFamily: 'Inter-Regular',
                          fontSize: 12,
                          color: colors.textSecondary,
                          marginTop: 2,
                        }}
                      >
                        {center.address}
                      </Text>
                    ) : null}
                  </Pressable>
                ))}
                {centers.length === 0 && (
                  <View style={{ paddingHorizontal: 14, paddingVertical: 16, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: colors.textMuted }}>
                      No centers available
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </FieldRow>

        {/* Address */}
        <FieldRow icon={MapPin} label="Address" colors={colors}>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Event address"
            placeholderTextColor={colors.textMuted}
            style={inputStyle()}
          />
        </FieldRow>

        {/* Lat / Lng side by side */}
        <FieldRow icon={Navigation} label="Coordinates" colors={colors} error={errors.latitude || errors.longitude}>
          <View style={{ flexDirection: 'row', gap: 10, marginLeft: 42 }}>
            <TextInput
              value={latitude}
              onChangeText={setLatitude}
              placeholder="Latitude"
              placeholderTextColor={colors.textMuted}
              style={{
                ...inputStyle(!!errors.latitude),
                marginLeft: 0,
                flex: 1,
              }}
            />
            <TextInput
              value={longitude}
              onChangeText={setLongitude}
              placeholder="Longitude"
              placeholderTextColor={colors.textMuted}
              style={{
                ...inputStyle(!!errors.longitude),
                marginLeft: 0,
                flex: 1,
              }}
            />
          </View>
        </FieldRow>

        {/* Point of contact */}
        <FieldRow icon={User} label="Point of Contact" colors={colors}>
          <TextInput
            value={pointOfContact}
            onChangeText={setPointOfContact}
            placeholder="Contact person"
            placeholderTextColor={colors.textMuted}
            style={inputStyle()}
          />
        </FieldRow>

        {/* Image URL */}
        <FieldRow icon={ImageIcon} label="Image URL" colors={colors}>
          <TextInput
            value={image}
            onChangeText={setImage}
            placeholder="https://..."
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            style={inputStyle()}
          />
        </FieldRow>

        {/* Category */}
        <FieldRow icon={Tag} label="Category" colors={colors}>
          <View style={{ flexDirection: 'row', gap: 8, marginLeft: 42, flexWrap: 'wrap' }}>
            {CATEGORY_OPTIONS.map((opt) => {
              const selected = category === opt.value
              return (
                <Pressable
                  key={opt.label}
                  onPress={() => setCategory(opt.value)}
                  style={{
                    paddingHorizontal: 18,
                    paddingVertical: 10,
                    borderRadius: 100,
                    minHeight: 40,
                    justifyContent: 'center',
                    backgroundColor: selected ? '#E8862A' : colors.iconBoxBg,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: selected ? 'Inter-SemiBold' : 'Inter-Regular',
                      fontSize: 13,
                      color: selected ? '#FFFFFF' : colors.textSecondary,
                    }}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </FieldRow>
      </ScrollView>

      {/* Sticky action bar */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.border,
          padding: 16,
          paddingHorizontal: isNarrow ? 16 : 40,
          backgroundColor: colors.panelBg,
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: 12,
          maxWidth: 900,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 10,
            minHeight: 44,
            backgroundColor: colors.iconBoxBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 14, color: colors.text }}>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={{
            paddingHorizontal: 32,
            paddingVertical: 12,
            borderRadius: 10,
            minHeight: 44,
            backgroundColor: '#E8862A',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#FFFFFF' }}>
              {isEdit ? 'Save Changes' : 'Create Event'}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  )
}
