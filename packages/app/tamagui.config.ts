import { config } from '@memewar/design-system'

export type Conf = typeof config

declare module 'tamagui' {
  // biome-ignore lint/suspicious/noEmptyInterface: <explanation>
  interface TamaguiCustomConfig extends Conf { }
}

export default config
