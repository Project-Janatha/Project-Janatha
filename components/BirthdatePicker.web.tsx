// In BirthdatePicker.web.js
import React, { useState, useEffect } from 'react'
import { View, Text, Pressable } from 'react-native'
// --- NEW: Import Headless UI ---
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDown } from 'lucide-react-native'

// --- Helper: Generate array of numbers ---
function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

// --- NEW: A fully styleable Select component ---
function Select({ label, value, options, onChange, className }) {
  // Find the currently selected option object
  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <Listbox value={value} onChange={onChange}>
      <div className={`relative ${className}`}>
        {/* This is the "select" box */}
        <Listbox.Button
          aria-label={label}
          className="relative w-full font-inter text-base bg-muted/50 dark:bg-muted-dark/10 text-content dark:text-content-dark py-3 px-4 rounded-lg border-2 border-transparent focus:border-primary outline-none text-left"
        >
          <span className="block truncate">{selectedOption?.label}</span>
          {/* A basic arrow. Replace with an SVG icon for best results. */}
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown className="text-content/50 dark:text-content-dark/50 ml-3" />
          </span>
        </Listbox.Button>

        {/* This is the dropdown menu */}
        <Transition
          as={React.Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background dark:bg-background-dark py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                className={({ active }) =>
                  // Apply all your styles! `font-inter` will work here.
                  `relative select-none py-2 px-4 font-inter ${
                    active ? 'bg-primary/10 text-primary' : 'text-content dark:text-content-dark'
                  }`
                }
              >
                {option.label}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}

// --- Main Picker Component (No changes from here down) ---
export default function BirthdatePicker({ value, onChange }) {
  const [date, setDate] = useState(value || new Date(2000, 0, 1))

  useEffect(() => {
    setDate(value || new Date(2000, 0, 1))
  }, [value])

  const currentYear = new Date().getFullYear()
  const years = range(currentYear - 100, currentYear)
    .reverse()
    .map((y) => ({ label: y, value: y }))

  const months = Array.from({ length: 12 }, (_, i) => ({
    label: new Date(2000, i).toLocaleString('en-US', { month: 'long' }),
    value: i, // 0 = Jan, 1 = Feb...
  }))

  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const days = range(1, daysInMonth).map((d) => ({ label: d, value: d }))

  const handlePartChange = (part, newValue) => {
    const newDate = new Date(date)
    const numValue = parseInt(newValue, 10)

    if (part === 'year') {
      newDate.setFullYear(numValue)
    } else if (part === 'month') {
      const currentDay = newDate.getDate()
      const daysInNewMonth = new Date(newDate.getFullYear(), numValue + 1, 0).getDate()
      if (currentDay > daysInNewMonth) {
        newDate.setDate(daysInNewMonth)
      }
      newDate.setMonth(numValue)
    } else if (part === 'day') {
      newDate.setDate(numValue)
    }

    setDate(newDate)
    // This is a NEW, important change:
    // We only call the parent `onChange` when the date is fully formed.
    // The Listbox `onChange` will trigger this.
    // To make it instant, we call it here.
    onChange(newDate)
  }

  // Helper to pass to the Listbox's `onChange`
  const handleYearChange = (val) => handlePartChange('year', val)
  const handleMonthChange = (val) => handlePartChange('month', val)
  const handleDayChange = (val) => handlePartChange('day', val)

  return (
    <View className="p-4 w-[480px]">
      <View className="flex-row justify-between space-x-2">
        {/* Month */}
        <Select
          label="Month"
          value={date.getMonth()}
          options={months}
          onChange={handleMonthChange}
          className="flex-[5]"
        />
        {/* Day */}
        <Select
          label="Day"
          value={date.getDate()}
          options={days}
          onChange={handleDayChange}
          className="flex-[2]"
        />
        {/* Year */}
        <Select
          label="Year"
          value={date.getFullYear()}
          options={years}
          onChange={handleYearChange}
          className="flex-[3]"
        />
      </View>
    </View>
  )
}
