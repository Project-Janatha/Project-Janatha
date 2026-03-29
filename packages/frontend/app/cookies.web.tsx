import { ScrollView } from 'react-native'
import { NavBar } from '../components/landing/NavBar'
import { Footer } from '../components/landing/Footer'
import { CookiePolicy } from '../components/landing/CookiePolicy'

export default function CookiePolicyWeb() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
      <NavBar />
      <CookiePolicy />
      <Footer />
    </ScrollView>
  )
}
