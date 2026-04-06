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
    if (__DEV__) {
      console.error('ErrorBoundary caught:', error, info.componentStack)
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
