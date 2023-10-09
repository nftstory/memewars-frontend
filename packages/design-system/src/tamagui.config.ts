import { createTamagui, createTokens } from 'tamagui'
// import { shorthands } from '@tamagui/shorthands'
import { themes, tokens as baseTokens } from '@tamagui/themes'
import { createMedia } from '@tamagui/react-native-media-driver'

import { animations } from './animations'
import { audiowideFont } from './fonts'

export const tokens = createTokens({
  ...baseTokens,
  color: {
    ...baseTokens.color,
    white: '#fff',
    background: '#A8CCC5',
    backgroundSecondary: '#6F9288',
    button: '#325D5B',
    input: '#1F1F1F',
    textPrimary: '#000',
    textSecondary: '#8A8A8A'
  },
})

export const config = createTamagui({
  animations,
  themes,
  tokens,
  // shorthands,
  defaultFont: 'body',
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  fonts: { body: audiowideFont, heading: audiowideFont },
  media: createMedia({
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  }),
})
