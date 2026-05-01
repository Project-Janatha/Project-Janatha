import React from 'react'
import { ScrollView, Platform } from 'react-native'

// Prevent overscroll bounce on web
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  document.documentElement.style.overscrollBehavior = 'none'
  document.body.style.overscrollBehavior = 'none'
}
import { NavBar } from '../components/landing/NavBar'
import { Hero } from '../components/landing/Hero'
import { AppPreview } from '../components/landing/AppPreview'
import { ProblemSection } from '../components/landing/ProblemSection'
import { WhySection } from '../components/landing/WhySection'
import { HowSection } from '../components/landing/HowSection'
import { CommunitySection } from '../components/landing/CommunitySection'
import { FinalCTA } from '../components/landing/FinalCTA'
import { GetAppSection } from '../components/landing/GetAppSection'
import { Footer } from '../components/landing/Footer'

export default function LandingPage() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#FAFAF7' }}
      contentContainerStyle={{ minHeight: '100%' }}
      bounces={false}
      overScrollMode="never"
    >
      <NavBar />
      <Hero />
      <ProblemSection />
      <WhySection />
      <AppPreview />
      <HowSection />
      <CommunitySection />
      <FinalCTA />
      <GetAppSection />
      <Footer />
    </ScrollView>
  )
}
