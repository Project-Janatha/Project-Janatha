import { ScrollView } from 'react-native'
import { NavBar } from '../components/landing/NavBar'
import { Footer } from '../components/landing/Footer'
import { PrivacyPolicy } from '../components/landing/PrivacyPolicy'

export default function PrivacyPolicyWeb() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
      <NavBar />
      <PrivacyPolicy />
      <Footer />
    </ScrollView>
  )
}
