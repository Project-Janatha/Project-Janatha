import React from 'react'
import { ScrollView } from 'react-native'
import { NavBar } from '../components/landing/NavBar'
import { Hero } from '../components/landing/Hero'
import { AppPreview } from '../components/landing/AppPreview'
import { ProblemSection } from '../components/landing/ProblemSection'
import { FinalCTA } from '../components/landing/FinalCTA'
import { Footer } from '../components/landing/Footer'

export default function LandingPage() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#FAFAF7' }}
      contentContainerStyle={{ minHeight: '100%' }}
    >
      <NavBar />
      <Hero />
      <AppPreview />
      <ProblemSection />
      <FinalCTA />
      <Footer />
    </ScrollView>
  )
}
