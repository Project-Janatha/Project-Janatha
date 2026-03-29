import { ScrollView } from 'react-native'
import { NavBar } from '../components/landing/NavBar'
import { Footer } from '../components/landing/Footer'
import { TermsOfService } from '../components/landing/TermsOfService'

export default function TermsWeb() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
      <NavBar />
      <TermsOfService />
      <Footer />
    </ScrollView>
  )
}
