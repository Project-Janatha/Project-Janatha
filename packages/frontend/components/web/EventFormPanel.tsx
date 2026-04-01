import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator } from 'react-native'
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Tag,
  Building2,
  ChevronDown,
} from 'lucide-react-native'
import { useDetailColors, type DetailColors } from '../../hooks/useDetailColors'
import {
  fetchEvent,
  fetchCenters,
  createEvent,
  updateEvent,
  type CenterData,
} from '../../utils/api'

const CATEGORY_OPTIONS = [
  { value: undefined as number | undefined, label: 'None' },
  { value: 91, label: 'Satsang' },
  { value: 92, label: 'Bhiksha' },
]

// ── Types ────────────────────────────────────────────────────────────────

type EventFormPanelProps = {
  eventId?: string
  onClose: () => void
  onSaved?: () => void
}

// ── Input component ──────────────────────────────────────────────────────

function FormInput({
  value,
  onChangeText,
  placeholder,
  colors,
  hasError,
  multiline,
  style,
  ...rest
}: {
  value: string
  onChangeText: (text: string) => void
  placeholder: string
  colors: DetailColors
  hasError?: boolean
  multiline?: boolean
  style?: any
  [key: string]: any
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : undefined}
      style={{
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: colors.text,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: hasError ? '#DC2626' : colors.border,
        backgroundColor: colors.cardBg,
        ...(multiline ? { minHeight: 100 } : {}),
        ...style,
      }}
      {...rest}
    />
  )
}

// ── Section label ────────────────────────────────────────────────────────

function SectionLabel({
  icon: Icon,
  label,
  colors,
}: {
  icon: React.ElementType
  label: string
  colors: DetailColors
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 7,
          backgroundColor: colors.iconBoxBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={14} color="#E8862A" />
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
  )
}

// ── Main component ───────────────────────────────────────────────────────

export default function EventFormPanel({ eventId, onClose, onSaved }: EventFormPanelProps) {
  const isEdit = !!eventId
  const colors = useDetailColors()

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
            setLatitude(event.latitude != null ? String(event.latitude) : '')
            setLongitude(event.longitude != null ? String(event.longitude) : '')
            setCenterID(event.centerID || '')
            setPointOfContact(event.pointOfContact || '')
            setImage(event.image || '')
            setCategory(event.category ?? undefined)

            const matchingCenter = allCenters.find((c) => c.centerID === event.centerID)
            if (matchingCenter) setCenterName(matchingCenter.name)
          }
        }
      } catch (err) {
        if (__DEV__) console.warn('[EventFormPanel]', err)
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
    if (!date.trim()) newErrors.date = 'Date is required'
    if (!centerID) newErrors.center = 'Center is required'

    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    if (!latitude || isNaN(lat) || lat < -90 || lat > 90) {
      newErrors.latitude = 'Valid latitude required'
    }
    if (!longitude || isNaN(lng) || lng < -180 || lng > 180) {
      newErrors.longitude = 'Valid longitude required'
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
      }
      onSaved?.()
      onClose()
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

  const errorText = (key: string) =>
    errors[key] ? (
      <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#DC2626', marginTop: 4 }}>
        {errors[key]}
      </Text>
    ) : null

  // ── Loading ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View
        style={{
          maxWidth: 440,
          width: '100%',
          height: '100%',
          backgroundColor: colors.panelBg,
          borderLeftWidth: 1,
          borderLeftColor: colors.border,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#E8862A" />
      </View>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <View
      style={{
        maxWidth: 440,
        width: '100%',
        height: '100%',
        backgroundColor: colors.panelBg,
        borderLeftWidth: 1,
        borderLeftColor: colors.border,
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          gap: 10,
        }}
      >
        {/* Top row: back */}
        <View className="flex-row items-center" style={{ justifyContent: 'space-between' }}>
          <Pressable
            onPress={onClose}
            className="flex-row items-center"
            style={{ gap: 4, padding: 8, minHeight: 44, minWidth: 44 }}
            accessibilityLabel="Close panel"
          >
            <ChevronLeft size={20} color={colors.iconHeader} />
            <Text
              style={{
                fontFamily: 'Inter-Regular',
                fontSize: 14,
                color: colors.iconHeader,
              }}
            >
              Back
            </Text>
          </Pressable>
        </View>

        {/* Title */}
        <Text
          style={{
            fontFamily: 'Inter-Bold',
            fontSize: 20,
            color: colors.text,
            lineHeight: 26,
          }}
        >
          {isEdit ? 'Edit Event' : 'Create Event'}
        </Text>
        <Text
          style={{
            fontFamily: 'Inter-Regular',
            fontSize: 13,
            color: colors.textSecondary,
          }}
        >
          {isEdit ? 'Update event details below' : 'Fill in the details for your new event'}
        </Text>
      </View>

      {/* Form body */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View>
          <SectionLabel icon={Tag} label="Title" colors={colors} />
          <FormInput
            value={title}
            onChangeText={setTitle}
            placeholder="Event title"
            colors={colors}
            hasError={!!errors.title}
          />
          {errorText('title')}
        </View>

        {/* Description */}
        <View>
          <SectionLabel icon={Tag} label="Description" colors={colors} />
          <FormInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the event..."
            colors={colors}
            multiline
          />
        </View>

        {/* Date & Time row */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <SectionLabel icon={Calendar} label="Date" colors={colors} />
            <FormInput
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              colors={colors}
              hasError={!!errors.date}
            />
            {errorText('date')}
          </View>
          <View style={{ flex: 1 }}>
            <SectionLabel icon={Clock} label="Time" colors={colors} />
            <FormInput
              value={time}
              onChangeText={setTime}
              placeholder="e.g. 10:30 AM"
              colors={colors}
            />
          </View>
        </View>

        {/* Center */}
        <View>
          <SectionLabel icon={Building2} label="Center" colors={colors} />
          <Pressable
            onPress={() => setShowCenterPicker(!showCenterPicker)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: errors.center ? '#DC2626' : colors.border,
              backgroundColor: colors.cardBg,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter-Regular',
                fontSize: 14,
                color: centerName ? colors.text : colors.textMuted,
              }}
            >
              {centerName || 'Select a center...'}
            </Text>
            <ChevronDown
              size={14}
              color={colors.textMuted}
              style={{ transform: [{ rotate: showCenterPicker ? '180deg' : '0deg' }] }}
            />
          </Pressable>
          {errorText('center')}

          {showCenterPicker && (
            <View
              style={{
                marginTop: 4,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.cardBg,
                maxHeight: 180,
                overflow: 'hidden',
              }}
            >
              <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
                {centers.map((center) => (
                  <Pressable
                    key={center.centerID}
                    onPress={() => selectCenter(center)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                      backgroundColor:
                        center.centerID === centerID ? 'rgba(232,134,42,0.08)' : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: center.centerID === centerID ? 'Inter-Medium' : 'Inter-Regular',
                        fontSize: 13,
                        color: center.centerID === centerID ? '#E8862A' : colors.text,
                      }}
                    >
                      {center.name}
                    </Text>
                    {center.address ? (
                      <Text
                        style={{
                          fontFamily: 'Inter-Regular',
                          fontSize: 11,
                          color: colors.textSecondary,
                          marginTop: 1,
                        }}
                      >
                        {center.address}
                      </Text>
                    ) : null}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Address */}
        <View>
          <SectionLabel icon={MapPin} label="Address" colors={colors} />
          <FormInput
            value={address}
            onChangeText={setAddress}
            placeholder="Event address"
            colors={colors}
          />
        </View>

        {/* Coordinates */}
        <View>
          <SectionLabel icon={MapPin} label="Coordinates" colors={colors} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <FormInput
                value={latitude}
                onChangeText={setLatitude}
                placeholder="Latitude"
                colors={colors}
                hasError={!!errors.latitude}
              />
            </View>
            <View style={{ flex: 1 }}>
              <FormInput
                value={longitude}
                onChangeText={setLongitude}
                placeholder="Longitude"
                colors={colors}
                hasError={!!errors.longitude}
              />
            </View>
          </View>
          {errorText('latitude')}
          {errorText('longitude')}
        </View>

        {/* Point of Contact */}
        <View>
          <SectionLabel icon={User} label="Point of Contact" colors={colors} />
          <FormInput
            value={pointOfContact}
            onChangeText={setPointOfContact}
            placeholder="Contact person"
            colors={colors}
          />
        </View>

        {/* Image URL */}
        <View>
          <SectionLabel icon={MapPin} label="Image URL" colors={colors} />
          <FormInput
            value={image}
            onChangeText={setImage}
            placeholder="https://..."
            colors={colors}
            autoCapitalize="none"
          />
        </View>

        {/* Category */}
        <View>
          <SectionLabel icon={Tag} label="Category" colors={colors} />
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORY_OPTIONS.map((opt) => {
              const selected = category === opt.value
              return (
                <Pressable
                  key={opt.label}
                  onPress={() => setCategory(opt.value)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 100,
                    backgroundColor: selected ? '#E8862A' : colors.iconBoxBg,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: selected ? 'Inter-SemiBold' : 'Inter-Regular',
                      fontSize: 12,
                      color: selected ? '#FFFFFF' : colors.textSecondary,
                    }}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>
      </ScrollView>

      {/* Sticky action bar */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.border,
          padding: 16,
          backgroundColor: colors.panelBg,
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: 10,
        }}
      >
        <Pressable
          onPress={onClose}
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 10,
            backgroundColor: colors.iconBoxBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 13, color: colors.text }}>
            Cancel
          </Text>
        </Pressable>
        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={{
            paddingHorizontal: 24,
            paddingVertical: 10,
            borderRadius: 10,
            backgroundColor: '#E8862A',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 13, color: '#FFFFFF' }}>
              {isEdit ? 'Save Changes' : 'Create Event'}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  )
}
