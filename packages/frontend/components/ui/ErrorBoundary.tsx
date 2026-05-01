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
        </View>
      )
    }

    return this.props.children
  }
}
