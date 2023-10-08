// don't import from here, that's handled already
// instead this is just setting types for this folder

import { config } from '@memewar/design-system'

type Conf = typeof config

declare module 'tamagui' {
  // biome-ignore lint/suspicious/noEmptyInterface: <explanation>
  interface TamaguiCustomConfig extends Conf { }
}

export default config
