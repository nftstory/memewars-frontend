import { ToastViewport as ToastViewportOg } from '@memewar/design-system'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export const ToastViewport = () => {
  const { top, right, left } = useSafeAreaInsets()
  return <ToastViewportOg top={top + 5} left={left} right={right} />
}
