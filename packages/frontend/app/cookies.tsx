import { View, Text, ScrollView } from 'react-native'

export default function CookiePolicy() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
      <View style={{ padding: 24, maxWidth: 800, alignSelf: 'center' }}>
        <Text style={{ fontSize: 36, fontWeight: 'bold', marginBottom: 8, color: '#1C1917' }}>
          Cookie Policy
        </Text>
        <Text style={{ fontSize: 14, color: '#78716C', marginBottom: 32 }}>
          Last updated: March 2026
        </Text>

        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24, marginBottom: 24 }}>
          This Cookie Policy explains what Cookies are and how Chinmaya Janata uses them on our mobile application and website.
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1C1917' }}>
          1. What Are Cookies
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24 }}>
          Cookies are small text files stored on your device when you visit websites or use applications. They help remember your preferences, analyze site traffic, and enhance your user experience.
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1C1917' }}>
          2. Types of Cookies We Use
        </Text>
        
        <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8, color: '#1C1917' }}>
          Essential Cookies
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24 }}>
          These cookies are necessary for the Service to function. They enable authentication, session management, and security features.
        </Text>

        <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8, color: '#1C1917' }}>
          Functional Cookies
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24 }}>
          These cookies remember your preferences and settings, such as your selected center and theme preferences.
        </Text>

        <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8, color: '#1C1917' }}>
          Analytics Cookies
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24 }}>
          We use analytics cookies to understand how users interact with our Service. These cookies collect anonymous information to help us improve the Service.
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1C1917' }}>
          3. Managing Cookies
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24, marginBottom: 8 }}>
          You can control or disable cookies through your browser or device settings. Note that blocking essential cookies may prevent the Service from functioning properly.
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1C1917' }}>
          4. Third-Party Cookies
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24 }}>
          We do not use third-party advertising cookies. Our analytics are provided through Cloudflare for security and performance purposes.
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1C1917' }}>
          5. Contact Us
        </Text>
        <Text style={{ fontSize: 15, color: '#44403C', lineHeight: 24 }}>
          If you have questions about our use of cookies, please contact us:{'\n'}
          Email: info@chinmayajanata.org{'\n'}
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
