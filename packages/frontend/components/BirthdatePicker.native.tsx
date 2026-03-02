import React, { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'

interface BirthdatePickerProps {
  value?: Date
  onChange: (date: Date) => void
}

export default function BirthdatePicker({ value, onChange }: BirthdatePickerProps) {
  const [date, setDate] = useState(value || new Date(2000, 0, 1))
  const [show, setShow] = useState(false)

  const handleChange = (event: any, selectedDate?: Date) => {
    setShow(false)
    
    if (selectedDate) {
      setDate(selectedDate)
      onChange(selectedDate)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <View style={{ padding: 16 }}>
      <Pressable
        onPress={() => setShow(true)}
        style={{
          backgroundColor: '#e5e5e5',
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: 'transparent',
        }}
      >
        <Text
          style={{
            fontFamily: 'Inter',
            fontSize: 16,
            color: '#3f3f46',
          }}
        >
          {formatDate(date)}
        </Text>
      </Pressable>

      {show && (
        <View>
          <DateTimePicker
            value={date}
            mode="date"
            display="spinner"
            onChange={handleChange}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
          />
          
          <Pressable
            onPress={() => setShow(false)}
            style={{
              backgroundColor: '#f97316',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              marginTop: 8,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter',
                fontSize: 16,
                color: '#ffffff',
                fontWeight: '600',
                textAlign: 'center',
              }}
            >
              Done
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}
