import React, { useMemo } from 'react'
import { View, Text, Pressable } from 'react-native'

function getWeekDays(): { dateStr: string; dayLetter: string; dayNum: number; isToday: boolean }[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days: { dateStr: string; dayLetter: string; dayNum: number; isToday: boolean }[] = []
  const letters = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  for (let offset = -3; offset <= 3; offset++) {
    const d = new Date(today)
    d.setDate(today.getDate() + offset)
    days.push({
      dateStr: d.toISOString().split('T')[0],
      dayLetter: letters[d.getDay()],
      dayNum: d.getDate(),
      isToday: offset === 0,
    })
  }
  return days
}

type WeekCalendarProps = {
  eventDates: Set<string>
  selectedDate: string | null
  onSelectDate: (date: string | null) => void
}

export default function WeekCalendar({ eventDates, selectedDate, onSelectDate }: WeekCalendarProps) {
  const weekDays = useMemo(() => getWeekDays(), [])

  return (
    <View className="flex-row justify-around px-2 py-2">
      {weekDays.map((d) => {
        const isSelected = selectedDate === d.dateStr
        const hasEvents = eventDates.has(d.dateStr)

        return (
          <Pressable
            key={d.dateStr}
            onPress={() => onSelectDate(isSelected ? null : d.dateStr)}
            className="items-center gap-1 px-1"
            style={{ minWidth: 42, minHeight: 44 }}
          >
            <Text className="text-[11px] font-inter text-gray-400 dark:text-gray-500">
              {d.dayLetter}
            </Text>
            <View
              className={`w-10 h-10 rounded-full items-center justify-center ${
                isSelected
                  ? 'bg-primary'
                  : d.isToday
                    ? 'border-2 border-primary'
                    : ''
              }`}
            >
              <Text
                className={`text-sm font-inter-semibold ${
                  isSelected
                    ? 'text-white'
                    : d.isToday
                      ? 'text-primary'
                      : 'text-content dark:text-content-dark'
                }`}
              >
                {d.dayNum}
              </Text>
            </View>
            {/* Event dot */}
            <View className={`w-1.5 h-1.5 rounded-full ${hasEvents ? 'bg-primary' : 'bg-transparent'}`} />
          </Pressable>
        )
      })}
    </View>
  )
}
