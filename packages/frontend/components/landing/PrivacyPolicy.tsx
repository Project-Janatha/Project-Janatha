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

        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24, marginBottom: 24 }}>
          Chinmaya Janata ("we," "our," or "us") operates the Chinmaya Janata mobile application and website. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1C1917' }}>
          1. Information We Collect
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24, marginBottom: 8 }}>
          <Text style={{ fontWeight: '600' }}>1.1 Personal Information you provide:</Text>
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24, paddingLeft: 12 }}>
          • Account credentials (username, password){'\n'}
          • Name (first name, last name){'\n'}
          • Email address{'\n'}
          • Phone number{'\n'}
          • Date of birth{'\n'}
          • Profile picture (optional){'\n'}
          • Personal interests (optional){'\n'}
          • Center affiliation
        </Text>

        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24, marginTop: 12, marginBottom: 8 }}>
          <Text style={{ fontWeight: '600' }}>1.2 Information collected automatically:</Text>
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24, paddingLeft: 12 }}>
          • Device information (device type, operating system, unique device identifiers){'\n'}
          • Location data (approximate location for finding nearby centers){'\n'}
          • Usage data (features used, event registrations){'\n'}
          • Cookies and similar tracking technologies
        </Text>

        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24, marginTop: 12, marginBottom: 8 }}>
          <Text style={{ fontWeight: '600' }}>1.3 Information from third parties:</Text>
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24, paddingLeft: 12 }}>
          We do not collect information from third-party sources.
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1C1917' }}>
          2. How We Use Your Information
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24, marginBottom: 8 }}>
          We use the information we collect to:
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24, paddingLeft: 12 }}>
          • Provide, maintain, and improve our services{'\n'}
          • Create and manage your account{'\n'}
          • Connect you with nearby Chinmaya Mission centers{'\n'}
          • Facilitate event registration and attendance{'\n'}
          • Send you updates about events at your center{'\n'}
          • Personalize your experience{'\n'}
          • Authenticate your identity when logging in{'\n'}
          • Respond to your questions and provide customer support{'\n'}
          • Comply with legal obligations
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1C1917' }}>
          3. Legal Basis for Processing
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24, marginBottom: 8 }}>
          We process your personal information under the following legal bases:
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24, paddingLeft: 12 }}>
          • <Text style={{ fontWeight: '600' }}>Consent:</Text> When you create an account and agree to our terms{'\n'}
          • <Text style={{ fontWeight: '600' }}>Contract:</Text> To provide the services you request{'\n'}
          • <Text style={{ fontWeight: '600' }}>Legitimate Interest:</Text> To improve our services and maintain community connections
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1C1917' }}>
          4. Information Sharing and Disclosure
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24, marginBottom: 8 }}>
          <Text style={{ fontWeight: '600' }}>4.1 We do NOT sell your personal information.</Text>
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24, marginBottom: 8 }}>
          <Text style={{ fontWeight: '600' }}>4.2 We may share information with:</Text>
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24, paddingLeft: 12 }}>
          • <Text style={{ fontWeight: '600' }}>Center Coordinators:</Text> Your center affiliation and event attendance may be visible to authorized center coordinators for community management purposes{'\n'}
          • <Text style={{ fontWeight: '600' }}>Service Providers:</Text> Cloud hosting and infrastructure providers (Cloudflare, AWS){'\n'}
          • <Text style={{ fontWeight: '600' }}>Legal Authorities:</Text> When required by law or to protect rights and safety
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1C1917' }}>
          5. Data Retention
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24 }}>
          We retain your personal information for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time. After account deletion, we may retain certain information as required by law or for legitimate business purposes.
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1C1917' }}>
          6. Data Security
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24, marginBottom: 8 }}>
          We implement appropriate technical and organizational security measures:
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24, paddingLeft: 12 }}>
          • Passwords are hashed using PBKDF2-SHA256{'\n'}
          • Data encrypted in transit (TLS 1.3){'\n'}
          • Access controls on database systems{'\n'}
          • Regular security reviews
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1C1917' }}>
          7. Your Rights
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24, marginBottom: 8 }}>
          You have the following rights regarding your personal information:
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24, paddingLeft: 12 }}>
          • <Text style={{ fontWeight: '600' }}>Access:</Text> Request a copy of your personal information{'\n'}
          • <Text style={{ fontWeight: '600' }}>Rectification:</Text> Request correction of inaccurate data{'\n'}
          • <Text style={{ fontWeight: '600' }}>Erasure:</Text> Request deletion of your account and data{'\n'}
          • <Text style={{ fontWeight: '600' }}>Portability:</Text> Request your data in a machine-readable format{'\n'}
          • <Text style={{ fontWeight: '600' }}>Objection:</Text> Object to certain processing activities
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24, marginTop: 8 }}>
          To exercise these rights, use the account settings in the app or contact us at support@chinmaya-janata.org.
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1C1917' }}>
          8. Location Services
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24 }}>
          We use your location to find nearby Chinmaya Mission centers and events. Location data is collected only when you explicitly use location-based features. You can disable location services in your device settings at any time.
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1C1917' }}>
          9. Children's Privacy
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24 }}>
          Our service is intended for users of all ages, including children. For users under 18, we recommend parental guidance. We do not knowingly collect personal information from children under 13 without parental consent. If you believe we have collected information from a child under 13 without parental consent, please contact us immediately.
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1C1917' }}>
          10. International Data Transfers
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24 }}>
          Our servers are located in the United States. If you are accessing our service from outside the US, please note that your information may be transferred to, stored, and processed in the US where our facilities are located. By using our service, you consent to such transfer.
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1C1917' }}>
          11. Third-Party Services
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24, marginBottom: 8 }}>
          Our service may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1C1917' }}>
          12. Changes to This Policy
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24 }}>
          We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of the service after such changes constitutes acceptance.
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1C1917' }}>
          13. Contact Us
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24 }}>
          If you have any questions about this Privacy Policy, please contact us at:{'\n'}
          Email: info@chinmayajanata.org{'\n'}
          Website: chinmayajanata.org/contact{'\n'}
          Address: Chinmaya Mission West, P.O. Box 129, Piercy, CA 95587
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
