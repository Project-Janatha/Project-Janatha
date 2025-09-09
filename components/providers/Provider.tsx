import { useColorScheme } from 'react-native'
import { TamaguiProvider, type TamaguiProviderProps } from 'tamagui'
import { ToastProvider, ToastViewport } from '@tamagui/toast'
import { CurrentToast } from '../CurrentToast'
import config from '../../tamagui.config'

//TODO: Describe this component
/**
 * Provider Component
 * @param {Omit<TamaguiProviderProps, 'config'> } children - Children props passed to the TamaguiProvider component.
 * @param {Omit<TamaguiProviderProps, 'config'> } rest - Other props passed to the TamaguiProvider component.
 * @return {JSX.Element} A Provider component that wraps the application with Tamagui and Toast providers.
 */
export default function Provider({ children, ...rest }: Omit<TamaguiProviderProps, 'config'>) {
  const colorScheme = useColorScheme()

  return (
    <TamaguiProvider
      config={config}
      defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}
      {...rest}
    >
      <ToastProvider
        swipeDirection="horizontal"
        duration={6000}
        native={
          [
            // uncomment the next line to do native toasts on mobile. NOTE: it'll require you making a dev build and won't work with Expo Go
            // 'mobile'
          ]
        }
      >
        {children}
        <CurrentToast />
        <ToastViewport top="$8" left={0} right={0} />
      </ToastProvider>
    </TamaguiProvider>
  )
}
