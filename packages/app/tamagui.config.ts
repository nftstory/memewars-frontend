import { config } from '@memewar/design-system'

export type Conf = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf { }
}

export default config
