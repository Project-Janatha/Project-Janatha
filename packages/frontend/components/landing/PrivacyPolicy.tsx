import { View, Text, ScrollView } from 'react-native'

export function PrivacyPolicy() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
      <View style={{ padding: 24, maxWidth: 800, alignSelf: 'center' }}>
        <Text style={{ fontSize: 36, fontWeight: 'bold', marginBottom: 8, color: '#1C1917' }}>
          Privacy Policy
        </Text>
        <Text style={{ fontSize: 14, color: '#78716C', marginBottom: 32 }}>
          Last updated: March 2026
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1C1917' }}>
          1. Information We Collect
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24 }}>
          We collect information you provide directly to us, including your name, email, phone number, date of birth, and center affiliation when you create an account or complete onboarding. You may also optionally provide interests and a profile picture.
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1C1917' }}>
          2. How We Use Your Information
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24 }}>
          We use your information to provide and improve our services, communicate with you about events and activities at your center, and personalize your experience. This includes finding nearby centers, registering for events, and connecting with your community.
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1C1917' }}>
          3. Information Sharing
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24 }}>
          We do not sell your personal information. We may share information with your center coordinators to facilitate community engagement and event organization. Your attendance at events may be visible to other attendees and center organizers.
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1C1917' }}>
          4. Location Data
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24 }}>
          We collect location data to help you find nearby Chinmaya centers and events. This data is used solely for providing location-based services and is not shared with third parties for marketing purposes.
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1C1917' }}>
          5. Data Security
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24 }}>
          We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Passwords are hashed using secure encryption.
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1C1917' }}>
          6. Your Rights
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24 }}>
          You have the right to access, update, or delete your personal information at any time through your account settings. You can also request deletion of your account and associated data.
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1C1917' }}>
          7. Children's Privacy
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24 }}>
          Our service is intended for users of all ages. For users under 18, we recommend parental guidance. We do not knowingly collect personal information from children under 13 without parental consent.
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1C1917' }}>
          8. Changes to This Policy
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24 }}>
          We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1C1917' }}>
          9. Contact Us
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24 }}>
          If you have any questions about this Privacy Policy, please contact us at support@chinmaya-janata.org or visit chinmaya-janata.org/contact.
        </Text>

        <View style={{ marginTop: 48, paddingTop: 24, borderTopWidth: 1, borderTopColor: '#E7E5E4' }}>
          <Text style={{ fontSize: 13, color: '#A8A29E' }}>
            © 2026 Chinmaya Janata. Built with love by CHYKs.
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}
