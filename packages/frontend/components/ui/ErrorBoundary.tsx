import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { View, Text, Pressable } from 'react-native'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log in prod too — silently swallowing crashes makes triage impossible.
    // The component stack lets us identify which JSX site rendered an
    // undefined element (the most common cause of React error #130 in prod).
    console.error('ErrorBoundary caught:', error, info.componentStack)
    if (typeof window !== 'undefined') {
      ;(window as any).__lastErrorInfo = {
        message: error?.message,
        stack: error?.stack,
        componentStack: info.componentStack,
      }
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false })
  }

  /**
   * Recovery path for users whose session is the cause of the crash (stale
   * auth tokens, malformed cached state, etc.). Wipes localStorage,
   * sessionStorage, and cookies for the current origin, then hard-reloads —
   * the page comes back as if it's a first visit.
   *
   * "Try Again" alone wasn't enough: re-rendering with the same broken
   * persisted state just loops on the same crash.
   */
  private handleResetAndReload = () => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage?.clear()
    } catch {
      // Ignore — some browsers block storage access in private/incognito.
    }
    try {
      window.sessionStorage?.clear()
    } catch {
      // Ignore.
    }
    if (typeof document !== 'undefined') {
      try {
        const cookies = document.cookie.split(';')
        for (const c of cookies) {
          const eq = c.indexOf('=')
          const name = (eq > -1 ? c.substring(0, eq) : c).trim()
          if (!name) continue
          // Expire on this path and root domain, with and without leading dot.
          const host = window.location.hostname
          const stripped = host.replace(/^www\./, '')
          for (const domain of [host, '.' + stripped, stripped]) {
            document.cookie =
              name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; domain=' + domain
          }
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/'
        }
      } catch {
        // Ignore — best-effort.
      }
    }
    window.location.replace(window.location.pathname || '/')
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: '600',
              color: '#1a1a1a',
              marginBottom: 8,
            }}
          >
            Something went wrong
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#666',
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            An unexpected error occurred. Please try again.
          </Text>
          <Pressable
            onPress={this.handleRetry}
            style={{
              backgroundColor: '#ea580c',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 9999,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
              Try Again
            </Text>
          </Pressable>

          {typeof window !== 'undefined' && (
            <Pressable
              onPress={this.handleResetAndReload}
              style={{ marginTop: 16, paddingHorizontal: 16, paddingVertical: 10 }}
            >
              <Text style={{ color: '#666', fontSize: 13, textDecorationLine: 'underline' }}>
                Still stuck? Reset session and reload
              </Text>
            </Pressable>
          )}
        </View>
      )
    }

    return this.props.children
  }
}
