import { ThemeProvider, Theme } from '@react-navigation/native'
import { useTheme } from '@tamagui/core'
import React from 'react'
import { ReactNode } from 'react'
import { useColorScheme } from 'react-native'

export const NavigationThemeProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const theme = useTheme()
  const colorScheme = useColorScheme()

  const NavigationTheme: Theme = {
    dark: colorScheme === 'dark',
    colors: {
      primary: theme.color.val as string,
      background: theme.background.val as string,
      card: theme.background.val as string,
      text: theme.color.val as string,
      border: theme.borderColor.val as string,
      notification: theme.color.val as string,
    },
  }

  return <ThemeProvider value={NavigationTheme}>{children}</ThemeProvider>
}
